import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../interfaces/user';
import { USER_STORAGE_KEY } from './auth';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/users`;

  private getHeaders(): HttpHeaders {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    const token = stored ? (JSON.parse(stored) as User).token : '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  getAll() {
    return this.http.get<User[]>(this.apiUrl);
  }

  getById(id: number) {
    return this.http.get<User>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  getProfile() {
    return this.http.get<User>(`${this.apiUrl}/profile`, { headers: this.getHeaders() });
  }

  updateProfile(data: Partial<User>) {
    return this.http.put<User>(`${this.apiUrl}/profile`, data, { headers: this.getHeaders() });
  }

  updatePassword(currentPassword: string, newPassword: string) {
    return this.http.put(
      `${this.apiUrl}/password`,
      { currentPassword, newPassword },
      { headers: this.getHeaders() }
    );
  }
}