import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Article, ArticlesResponse } from '../interfaces/article';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private readonly apiUrl = `${environment.apiUrl}/api/articles`;

  constructor(private http: HttpClient) {}

  getArticles(): Observable<Article[]> {
    return this.http.get<ArticlesResponse | Article[]>(this.apiUrl).pipe(
      map((response) => (Array.isArray(response) ? response : response.results ?? [])),
    );
  }

  createArticle(article: Partial<Article>): void {
    console.warn('createArticle pendiente de implementar con API', article);
  }
}
