import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_URL } from '../api.config';
import { ApiCategoriesResponse, Category as CategoryModel } from '../interfaces/category';

@Injectable({
  providedIn: 'root',
})
export class Category {

  private http = inject(HttpClient);

  /** Categorías desde el backend (GET /api/categories) */
  getCategories(): Observable<CategoryModel[]> {
    return this.http
      .get<ApiCategoriesResponse>(`${API_URL}/categories`)
      .pipe(map(res => res.categories));
  }
}
