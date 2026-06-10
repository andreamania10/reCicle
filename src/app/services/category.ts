import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Category, CategoryResponse } from '../interfaces/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/categories`;

  getAll() {
    return this.http.get<CategoryResponse>(this.apiUrl);
  }

  getById(id: number) {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }
}