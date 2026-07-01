import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../interfaces/user';
import { Auth } from './auth';

export interface UpdateProfilePayload {
  username: string;
  email: string;
  location: string;
  avatar_url: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private auth = inject(Auth);
  private apiUrl = `${environment.apiUrl}/api/users`;

  getAll() {
    return this.http.get<User[]>(this.apiUrl);
  }

  getById(id: number): Observable<User> {
    return this.http
      .get<unknown>(`${this.apiUrl}/${id}`, { headers: this.buildHeaders() })
      .pipe(map((response) => this.normalizeUser(response)));
  }

  updateProfile(data: UpdateProfilePayload): Observable<User> {
    return this.http
      .put<unknown>(`${this.apiUrl}/profile`, data, { headers: this.buildHeaders() })
      .pipe(
        map((response) => this.mergeProfileResponse(response, data)),
        catchError((error) => throwError(() => error)),
      );
  }

  updatePassword(currentPassword: string, newPassword: string) {
    return this.http.put(
      `${this.apiUrl}/password`,
      { currentPassword, newPassword },
      { headers: this.buildHeaders() },
    );
  }

  private buildHeaders(token?: string): HttpHeaders {
    const authToken = token ?? this.auth.currentUser()?.token ?? '';
    if (!authToken) {
      return new HttpHeaders();
    }
    return new HttpHeaders({ Authorization: `Bearer ${authToken}` });
  }

  private mergeProfileResponse(response: unknown, payload: UpdateProfilePayload): User {
    const normalized = this.normalizeUser(response);
    const current = this.auth.currentUser();

    if (this.hasProfileData(normalized)) {
      return {
        ...normalized,
        token: current?.token,
      };
    }

    return {
      id: current?.id ?? normalized.id,
      username: payload.username,
      email: payload.email,
      location: payload.location,
      avatar_url: payload.avatar_url || null,
      role: current?.role ?? normalized.role ?? '',
      avg_rating: current?.avg_rating ?? normalized.avg_rating ?? '',
      status: current?.status ?? normalized.status,
      token: current?.token,
    };
  }

  private hasProfileData(user: User): boolean {
    return Boolean(user?.id || user?.username || user?.email);
  }

  private normalizeUser(response: unknown): User {
    if (!response || typeof response !== 'object') {
      return response as User;
    }

    const root = response as Record<string, unknown>;
    const candidate =
      root['user'] ??
      root['profile'] ??
      root['result'] ??
      root['data'] ??
      response;

    const nested =
      candidate && typeof candidate === 'object'
        ? (candidate as Record<string, unknown>)
        : root;

    const id = Number(nested['id'] ?? root['id'] ?? 0);
    const role = String(nested['role'] ?? root['role'] ?? '');

    return {
      id: Number.isInteger(id) && id > 0 ? id : Number(this.auth.currentUser()?.id ?? 0),
      username: String(nested['username'] ?? root['username'] ?? ''),
      email: String(nested['email'] ?? root['email'] ?? ''),
      role: role || String(this.auth.currentUser()?.role ?? ''),
      avatar_url: ((nested['avatar_url'] ?? root['avatar_url']) as string | null | undefined) ?? null,
      location: String(nested['location'] ?? root['location'] ?? ''),
      avg_rating: String(
        nested['avg_rating'] ?? nested['avgRating'] ?? root['avg_rating'] ?? '',
      ),
      status: (nested['status'] ?? root['status']) as string | undefined,
    };
  }
}
