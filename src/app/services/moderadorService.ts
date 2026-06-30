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
  
    console.log('Payload enviado', {
      action,
      moderator_note:
        action === 'accept'
          ? 'Reporte aprobado'
          : 'Reporte rechazado'
    });
  
    return this.http.put(
      `${environment.apiUrl}/api/reports/resolution/${reportId}`,
      {
        action,
        moderator_note:
          action === 'accept'
            ? 'Reporte aprobado'
            : 'Reporte rechazado'
      },
      { headers }
    );
  }

  private getHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }
}