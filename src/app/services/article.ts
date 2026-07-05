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
    return this.getArticlesPage(1).pipe(
      map((response) => response.results ?? []),
    );
  }

  getArticlesPage(page: number, filters?: Record<string, string>, pageSize = this.defaultPageSize): Observable<ArticleResponse> {
    let params = new HttpParams()
      .set('page', String(page))
      .set('pageSize', String(pageSize));

    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        if (value) {
          params = params.set(key, value);
        }
      }
    }

    return this.http.get<ArticleResponse>(this.apiUrl, { params });
  }

  hasMorePages(resultsLength: number, pageSize = this.defaultPageSize): boolean {
    return resultsLength >= pageSize;
  }

  searchArticles(search: string, page = 1): Observable<ArticleResponse> {
    const term = search.trim();
    const filters = term ? { search: term } : undefined;
    return this.getArticlesPage(page, filters);
  }

  getFiltered(
    filters: { condition?: string; location?: string; search?: string; category_id?: string; max_price?: string },
    page = 1,
  ): Observable<ArticleResponse> {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, value]) => value),
    ) as Record<string, string>;

    return this.getArticlesPage(page, params);
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

  getByCategoryId(categoryId: number, page = 1): Observable<ArticleResponse> {
    const id = Number(categoryId);

    if (!Number.isInteger(id) || id <= 0) {
      throw new Error('category_id debe ser un número entero válido');
    }

    return this.getArticlesPage(page, { category_id: String(id) });
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