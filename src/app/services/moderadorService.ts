import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Report, ApiListResponse, HistoricoItem } from '../interfaces/report';

@Injectable({
  providedIn: 'root'
})
export class ModeradorService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/reports`;

  getReportesArticulos(token: string): Observable<ApiListResponse<Report>> {
    return this.http.get<ApiListResponse<Report>>(
      `${this.baseUrl}/pending/articles`,
      {
        headers: this.getHeaders(token)
      }
    );
  }

  getReportesUsuarios(token: string): Observable<ApiListResponse<Report>> {
    return this.http.get<ApiListResponse<Report>>(
      `${this.baseUrl}/pending/users`,
      {
        headers: this.getHeaders(token)
      }
    );
  }

  getHistorico(
    token: string
  ): Observable<ApiListResponse<HistoricoItem> | HistoricoItem[]> {
    return this.http.get<ApiListResponse<HistoricoItem> | HistoricoItem[]>(
      `${this.baseUrl}/history`,
      {
        headers: this.getHeaders(token)
      }
    );
  }

  resolverReporte(
    reportId: number,
    action: 'accept' | 'reject',
    token: string
  ): Observable<unknown> {
    const headers = this.getHeaders(token);
    const resolution = action === 'reject' ? 'REJECTED' : 'APPROVED';

    return this.http.put(
      `${environment.apiUrl}/api/reports/resolution/${reportId}`,
      { resolution },
      { headers }
    );
  }

  eliminarArticulo(articleId: number, token: string): Observable<unknown> {
    return this.http.delete(
      `${environment.apiUrl}/api/articles/${articleId}`,
      {
        headers: this.getHeaders(token)
      }
    );
  }

  private getHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}