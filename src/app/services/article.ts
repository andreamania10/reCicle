import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Article, ArticleResponse } from '../interfaces/article';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/articles`;

  getAll() {
    return this.http.get<ArticleResponse>(this.apiUrl);
  }

  getById(id: number) {
    return this.http.get<Article>(`${this.apiUrl}/${id}`);
  }

  create(article: Article) {
    return this.http.post<Article>(this.apiUrl, article);
  }

  update(id: number, article: Article) {
    return this.http.put<Article>(`${this.apiUrl}/${id}`, article);
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}