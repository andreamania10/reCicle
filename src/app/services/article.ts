import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_URL } from '../api.config';
import { ApiArticlesResponse } from '../interfaces/article';

export interface ArticleFilters {
  page?: number;
  pageSize?: number;
  category_id?: number;
  min_price?: number;
  max_price?: number;
  condition?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  private http = inject(HttpClient);

  private articles: any[] = [];

  /** Artículos publicados desde el backend, con paginación y filtros */
  getPublishedArticles(filters: ArticleFilters = {}): Observable<ApiArticlesResponse> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, String(value));
      }
    });
    return this.http.get<ApiArticlesResponse>(`${API_URL}/articles`, { params });
  }

  // --- Métodos locales previos (usados por categories y article-create) ---

  getArticles() {
    return this.articles;
  }

  createArticle(article: any) {
    this.articles.push(article);
  }
}
