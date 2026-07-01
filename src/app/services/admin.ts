import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { USER_STORAGE_KEY } from './auth';
import { User } from '../interfaces/user';

export interface AdminStats {
  articulosPublicados: number;
  usuariosActivos: number;
  reportesGestionados: number;
  articulosVendidos: number;
}

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  avg_rating: number;
  location: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const stored = localStorage.getItem(USER_STORAGE_KEY);
    const token = stored ? (JSON.parse(stored) as User).token : '';
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  // Estadísticas
  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/api/admin/stats`, { headers: this.getHeaders() });
  }

  // Usuarios
  getUsers(): Observable<AdminUser[]> {
    return this.http.get<AdminUser[]>(`${this.apiUrl}/api/admin/users`, { headers: this.getHeaders() });
  }

  updateUser(userId: number, data: { username: string; email: string; location: string }): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/admin/users/${userId}`, data, { headers: this.getHeaders() });
  }

  changeUserPassword(userId: number, newPassword: string): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/api/admin/users/${userId}/password`,
      { newPassword },
      { headers: this.getHeaders() },
    );
  }

  updateUserRole(userId: number, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/admin/users/${userId}/role`, { role }, { headers: this.getHeaders() });
  }

  blockUser(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/admin/users/${userId}/block`, {}, { headers: this.getHeaders() });
  }

  unblockUser(userId: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/admin/users/${userId}/unblock`, {}, { headers: this.getHeaders() });
  }

  deleteUser(userId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/admin/users/${userId}`, { headers: this.getHeaders() });
  }

  // Categorías
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/api/categories`, { headers: this.getHeaders() });
  }

  createCategory(name: string, slug: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/categories`, { name, slug }, { headers: this.getHeaders() });
  }

  updateCategory(id: number, name: string, slug: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/categories/${id}`, { name, slug }, { headers: this.getHeaders() });
  }

  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/categories/${id}`, { headers: this.getHeaders() });
  }
}
