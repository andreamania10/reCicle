import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { CreateArticleReportPayload, CreateUserReportPayload } from '../interfaces/report';

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/reports`;

  reportArticle(payload: CreateArticleReportPayload, token: string) {
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.post(this.apiUrl, payload, { headers });
  }

  reportUser(payload: CreateUserReportPayload, token: string) {
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.post(this.apiUrl, payload, { headers });
  }

}