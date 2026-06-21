import { map, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpEvent } from '@angular/common/http';
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

  getByCategoryId(categoryId: number): Observable<Article[]> {
    const id = Number(categoryId);

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('category_id debe ser un número entero válido');
    }

    const params = new HttpParams().set('category_id', String(id));

    return this.http.get<ArticleResponse>(this.apiUrl, { params }).pipe(
      map((response) => response.results ?? []),
    );
  }

  getById(id: number) {
    return this.http.get<Article>(`${this.apiUrl}/${id}`);
  }

  create(article: Article) {
    return this.http.post<Article>(this.apiUrl, article);
  }

  update(id: number, article: Article, token: string) {
  const headers = { Authorization: `Bearer ${token}` };
  return this.http.put<Article>(`${this.apiUrl}/${id}`, article, { headers });
}
  
  updateStatus(id: number, status: string, token: string) {
  const headers = { Authorization: `Bearer ${token}` };
  return this.http.patch<Article>(`${this.apiUrl}/${id}/status`, { status }, { headers });
}

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  

  
createWithMedia(formData: FormData) {
  return this.http.post(this.apiUrl, formData, {
    reportProgress: true,
    observe: 'events'
  });
}

  

}