import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface ReportArticlePayload {
  type: 'Articulo';
  article_id: number;
  reason: string;
}

export interface ReportUserPayload {
  type: 'Usuario';
  reported_user_id: number;
  article_id: number;
  reason: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {

  private http = inject(HttpClient);
  private articlesApiUrl = `${environment.apiUrl}/api/reports`;
  private usersApiUrl = `${environment.apiUrl}/api/users/reports`;

  reportArticle(payload: ReportArticlePayload, token: string) {
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.post(this.articlesApiUrl, payload, { headers });
  }

  reportUser(payload: ReportUserPayload, token: string) {
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.post(this.usersApiUrl, payload, { headers });
  }
}