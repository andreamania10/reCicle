import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ModeradorService {

  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/api/reports`;

  getReportesArticulos(token: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/pending/articles`, {
      headers: this.getHeaders(token)
    });
  }
  
  getReportesUsuarios(token: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/pending/users`, {
      headers: this.getHeaders(token)
    });
  }
  
  getHistorico(token: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/history`, {
      headers: this.getHeaders(token)
    });
  }

  // Detalle de un reporte
  getDetalleReporte(id: number, tipo: 'articles' | 'users', token: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/pending/${tipo}/${id}`, {
      headers: this.getHeaders(token)
    });
  }

  aceptarReporte(id: number, token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/accept`, {}, {
      headers: this.getHeaders(token)
    });
  }

  rechazarReporte(id: number, token: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/${id}/reject`, {}, {
      headers: this.getHeaders(token)
    });
  }

  private getHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  resolverReporte(id: number, decision: 'accept' | 'reject', token: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/resolution/${id}`, 
      { decision }, 
      { headers: this.getHeaders(token) }
    );
  }

  eliminarArticulo(articleId: number, token: string) {
    const headers = {
      Authorization: `Bearer ${token}`
    };
  
    return this.http.delete(
      `${environment.apiUrl}/api/articles/${articleId}`,
      { headers }
    );
  }
  
  suspenderUsuario(userId: number, token: string) {
    const headers = {
      Authorization: `Bearer ${token}`
    };
  
    return this.http.patch(
      `${environment.apiUrl}/api/users/${userId}/suspend`,
      {},
      { headers }
    );
  }
}