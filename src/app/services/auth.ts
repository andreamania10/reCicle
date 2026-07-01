import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  JwtPayload,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from '../interfaces/user';
import { USER_STORAGE_KEY } from '../constants/storage';

/** @deprecated Import from constants/storage */
export { USER_STORAGE_KEY } from '../constants/storage';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly apiUrl = `${environment.apiUrl}/api/users`;
  readonly currentUser = signal<User | null>(this.loadStoredUser());

  constructor(private http: HttpClient) {}

  isLoggedIn(): boolean {
    const user = this.loadStoredUser();
    this.currentUser.set(user);
    return user !== null;
  }

  login(credentials: LoginRequest): Observable<User> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      switchMap((response) => this.fetchUserAfterLogin(response)),
      tap((user) => this.setUser(user)),
      catchError((error: HttpErrorResponse | Error) =>
        throwError(() => new Error(this.getErrorMessage(error, 'Error al iniciar sesión'))),
      ),
    );
  }

  register(data: RegisterRequest): Observable<User> {
    const body: RegisterRequest = {
      username: data.username.trim(),
      email: data.email.trim(),
      password: data.password,
    };

    const location = data.location?.trim();
    if (location) {
      body.location = location;
    }

    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, body).pipe(
      switchMap((response) => {
        if (!this.isRegisterSuccessful(response)) {
          throw new Error(response?.message || 'No se pudo completar el registro');
        }

        return this.login({ email: body.email, password: body.password }).pipe(
          switchMap((user) => (location ? this.persistLocation(user, location) : of(user))),
        );
      }),
      catchError((error: HttpErrorResponse | Error) =>
        throwError(() => new Error(this.getErrorMessage(error, 'Error al registrarse'))),
      ),
    );
  }

  /**
   * El endpoint de registro no acepta/guarda la localización, así que en
   * cuanto tenemos el token (tras el login automático) la persistimos con el
   * endpoint de edición de perfil, que sí soporta este campo.
   */
  private persistLocation(user: User, location: string): Observable<User> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${user.token}` });
    const payload = {
      username: user.username ?? '',
      email: user.email ?? '',
      location,
      avatar_url: user.avatar_url ?? '',
    };

    return this.http.put(`${this.apiUrl}/profile`, payload, { headers }).pipe(
      map(() => ({ ...user, location })),
      tap((updatedUser) => this.setUser(updatedUser)),
      catchError(() => {
        const fallbackUser = { ...user, location };
        this.setUser(fallbackUser);
        return of(fallbackUser);
      }),
    );
  }

  private getErrorMessage(error: HttpErrorResponse | Error, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const body = error.error;

      if (typeof body === 'string') {
        try {
          return JSON.parse(body).message || body;
        } catch {
          return body || fallback;
        }
      }

      return body?.message || fallback;
    }

    return error.message || fallback;
  }

  setUser(user: User): void {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    this.currentUser.set(user);
  }

  logout(): void {
    localStorage.removeItem(USER_STORAGE_KEY);
    this.currentUser.set(null);
  }

  private fetchUserAfterLogin(response: LoginResponse): Observable<User> {
    const token = this.extractToken(response);
    const payload = this.decodeToken(token);
    const userId = payload?.userId ?? payload?.id;

    if (!userId) {
      throw new Error('No se pudo obtener el usuario del token');
    }

    return this.http
      .get<User>(`${this.apiUrl}/${userId}`, {
        headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
      })
      .pipe(
        map((user) => ({
          ...user,
          id: user.id ?? userId,
          role: user.role ?? payload?.role ?? response.role ?? '',
          token,
        })),
      );
  }

  private extractToken(response: LoginResponse): string {
    if (!response?.token || response.message !== 'Login correcto') {
      throw new Error(response?.message || 'Credenciales incorrectas');
    }

    return response.token;
  }

  private isRegisterSuccessful(response: RegisterResponse): boolean {
    // Cualquier respuesta 2xx del backend indica éxito:
    // puede venir con affectedRows/insertId (MySQL directo) o solo con message
    return response?.affectedRows === 1 || !!response?.insertId || !!response?.message;
  }

  private decodeToken(token: string): JwtPayload | null {
    try {
      const base64 = token.split('.')[1]?.replace(/-/g, '+').replace(/_/g, '/');
      if (!base64) return null;

      return JSON.parse(atob(base64)) as JwtPayload;
    } catch {
      return null;
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload?.exp) return false;
      return Date.now() / 1000 > payload.exp;
    } catch {
      return true;
    }
  }

  private loadStoredUser(): User | null {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (!stored) return null;

    try {
      const user = JSON.parse(stored) as User;
      if (!user?.id || !user?.role) {
        localStorage.removeItem(USER_STORAGE_KEY);
        return null;
      }

      if (user.token && this.isTokenExpired(user.token)) {
        localStorage.removeItem(USER_STORAGE_KEY);
        return null;
      }

      return user;
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY);
      return null;
    }
  }
}
