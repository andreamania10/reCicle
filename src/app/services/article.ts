import { map, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Article, ArticleResponse } from '../interfaces/article';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private readonly apiUrl = `${environment.apiUrl}/api/articles`;

  constructor(private http: HttpClient) {}

  getArticles(): Observable<Article[]> {
    return this.http.get<ArticleResponse | Article[]>(this.apiUrl).pipe(
      map((response) => (Array.isArray(response) ? response : response.results ?? [])),
    );
  }

  createArticle(article: Partial<Article>): void {
    console.warn('createArticle pendiente de implementar con API', article);
  }

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