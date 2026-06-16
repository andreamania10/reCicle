import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Category, CategoriesResponse } from '../interfaces/category';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly apiUrl = `${environment.apiUrl}/api/categories`;

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<CategoriesResponse | Category[]>(this.apiUrl).pipe(
      map((response) => (Array.isArray(response) ? response : response.categories ?? [])),
    );
  }
  getAll() {
    return this.http.get<CategoriesResponse>(this.apiUrl);
  }

  getById(id: number) {
    return this.http.get<Category>(`${this.apiUrl}/${id}`);
  }
}
