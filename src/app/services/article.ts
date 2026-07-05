import { map, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Article, ArticleResponse } from '../interfaces/article';

@Injectable({
  providedIn: 'root',
})
export class ArticleService {
  private readonly apiUrl = `${environment.apiUrl}/api/articles`;
  private readonly defaultPageSize = 12;

  constructor(private http: HttpClient) {}

  getArticles(): Observable<Article[]> {
    return this.http
      .get<ArticleResponse | Article[]>(this.apiUrl, { params: this.buildListParams() })
      .pipe(
        map((response) => (Array.isArray(response) ? response : response.results ?? [])),
      );
  }

  searchArticles(search: string): Observable<Article[]> {
    const term = search.trim();
    const params = this.buildListParams(term ? { search: term } : undefined);

    return this.http.get<ArticleResponse>(this.apiUrl, { params }).pipe(
      map((response) => response.results ?? []),
    );
  }

  getFiltered(filters: { condition?: string; location?: string; search?: string; category_id?: string }): Observable<Article[]> {
    const params = this.buildListParams(
      Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) as Record<string, string>
    );
    return this.http.get<ArticleResponse>(this.apiUrl, { params }).pipe(
      map((response) => response.results ?? [])
    );
  }

  getByStatus(status: string, pageSize = 100): Observable<Article[]> {
    const params = this.buildListParams({ filterStatus: status, pageSize: String(pageSize) });
    return this.http.get<ArticleResponse>(this.apiUrl, { params }).pipe(
      map((response) => response.results ?? [])
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

    const params = this.buildListParams({ category_id: String(id) });

    return this.http.get<ArticleResponse>(this.apiUrl, { params }).pipe(
      map((response) => response.results ?? []),
    );
  }

  private buildListParams(filters?: Record<string, string>): HttpParams {
    let params = new HttpParams().set('page', '1').set('pageSize', String(this.defaultPageSize));

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value) {
          params = params.set(key, value);
        }
      }
    }

    return params;
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

  createWithMedia(formData: FormData, token: string): Observable<Article> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http.post<Article>(this.apiUrl, formData, { headers });
  }

  getMyArticles(token: string): Observable<Article[]> {
    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    return this.http
      .get<Article[] | ArticleResponse>(`${this.apiUrl}/user/me`, { headers })
      .pipe(
        map((response) =>
          Array.isArray(response) ? response : (response as ArticleResponse).results ?? []
        )
      );
  }

}