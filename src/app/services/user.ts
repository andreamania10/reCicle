import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/users`;

  getAll() {
    return this.http.get<User[]>(this.apiUrl);
  }

  getById(id: number) {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }
}