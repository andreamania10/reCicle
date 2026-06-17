import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  JwtPayload,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  User,
} from '../interfaces/user';

/** Clave en localStorage para la sesión iniciada */
export const USER_STORAGE_KEY = 'user';

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
      map((response) => this.mapLoginResponse(response, credentials.email)),
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

    if (data.location?.trim()) {
      body.location = data.location.trim();
    }

    return this.http.post<RegisterResponse>(`${this.apiUrl}/register`, body).pipe(
      switchMap((response) => {
        if (response?.affectedRows !== 1) {
          throw new Error(response?.message || 'No se pudo completar el registro');
        }

        return this.login({ email: body.email, password: body.password });
      }),
      catchError((error: HttpErrorResponse | Error) =>
        throwError(() => new Error(this.getErrorMessage(error, 'Error al registrarse'))),
      ),
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

  private mapLoginResponse(response: LoginResponse, email: string): User {
    if (!response?.token || !response?.role || response.message !== 'Login correcto') {
      throw new Error(response?.message || 'Credenciales incorrectas');
    }

    const payload = this.decodeToken(response.token);
    if (!payload?.userId) {
      throw new Error('No se pudo obtener el usuario');
    }

    return {
      id: payload.userId,
      email,
      role: response.role,
      token: response.token,
    };
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

  private loadStoredUser(): User | null {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    if (!stored) return null;

    try {
      const user = JSON.parse(stored) as User;
      if (!user?.id || !user?.role) {
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
