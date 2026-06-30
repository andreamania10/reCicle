import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  ArticleReportDetail,
  CreateArticleReportPayload,
  CreateReportPayload,
  CreateUserReportPayload,
  PendingArticleReport,
  PendingUserReport,
  ReportHistoryItem,
  ResolveReportPayload,
  UserReportDetail,
} from '../interfaces/report';

@Injectable({
  providedIn: 'root',
})
export class ReportService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/reports`;

  reportArticle(payload: CreateArticleReportPayload, token: string) {
    return this.createReport(payload, token);
  }

  reportUser(payload: CreateUserReportPayload, token: string) {
    return this.createReport(payload, token);
  }

  createReport(payload: CreateReportPayload, token: string) {
    return this.http.post(this.apiUrl, payload, { headers: this.authHeaders(token) });
  }

  getPendingArticles(token: string): Observable<PendingArticleReport[]> {
    return this.http
      .get<unknown>(`${this.apiUrl}/pending/articles`, { headers: this.authHeaders(token) })
      .pipe(
        map((response) =>
          this.extractResults(response)
            .map((item) => this.normalizePendingArticle(item))
            .filter((item): item is PendingArticleReport => item !== null),
        ),
      );
  }

  getPendingUsers(token: string): Observable<PendingUserReport[]> {
    return this.http
      .get<unknown>(`${this.apiUrl}/pending/users`, { headers: this.authHeaders(token) })
      .pipe(
        map((response) =>
          this.extractResults(response)
            .map((item) => this.normalizePendingUser(item))
            .filter((item): item is PendingUserReport => item !== null),
        ),
      );
  }

  getPendingArticleDetail(reportId: number | string, token: string): Observable<ArticleReportDetail> {
    return this.http
      .get<unknown>(`${this.apiUrl}/pending/articles/${reportId}`, {
        headers: this.authHeaders(token),
      })
      .pipe(map((response) => this.normalizeArticleDetail(response)));
  }

  getPendingUserDetail(reportId: number, token: string): Observable<UserReportDetail> {
    return this.http
      .get<unknown>(`${this.apiUrl}/pending/users/${reportId}`, {
        headers: this.authHeaders(token),
      })
      .pipe(map((response) => this.normalizeUserDetail(response)));
  }

  getHistory(token: string): Observable<ReportHistoryItem[]> {
    return this.http
      .get<unknown>(`${this.apiUrl}/history`, { headers: this.authHeaders(token) })
      .pipe(
        map((response) =>
          this.extractResults(response)
            .map((item) => this.normalizeHistoryItem(item))
            .filter((item): item is ReportHistoryItem => item !== null),
        ),
      );
  }

  resolveReport(reportId: number, payload: ResolveReportPayload, token: string) {
    return this.http.put<{ message?: string }>(`${this.apiUrl}/resolution/${reportId}`, payload, {
      headers: this.authHeaders(token),
    });
  }

  acceptReport(reportId: number, moderatorNote: string, token: string) {
    return this.resolveReport(reportId, { action: 'accept', moderator_note: moderatorNote }, token);
  }

  rejectReport(reportId: number, moderatorNote: string, token: string) {
    return this.resolveReport(reportId, { action: 'reject', moderator_note: moderatorNote }, token);
  }

  private extractResults(response: unknown): Record<string, unknown>[] {
    if (Array.isArray(response)) {
      return response.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object');
    }

    if (!response || typeof response !== 'object') {
      return [];
    }

    const obj = response as Record<string, unknown>;

    for (const key of ['results', 'data', 'reports', 'items', 'rows']) {
      const value = obj[key];
      if (Array.isArray(value)) {
        return value.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object');
      }
    }

    return [];
  }

  private normalizePendingArticle(raw: Record<string, unknown>): PendingArticleReport | null {
    const reportId = Number(raw['report_id'] ?? raw['id'] ?? raw['reportId']);
    if (!Number.isFinite(reportId) || reportId <= 0) return null;

    return {
      report_id: reportId,
      report_reason: String(raw['report_reason'] ?? raw['reason'] ?? ''),
      report_created_at: String(raw['report_created_at'] ?? raw['created_at'] ?? ''),
      reporter_username: String(
        raw['reporter_username'] ?? raw['reporter_name'] ?? raw['reporter_user_username'] ?? 'Usuario',
      ),
      article_id: Number(raw['article_id'] ?? raw['articleId'] ?? 0),
      article_title: String(raw['article_title'] ?? raw['title'] ?? 'Artículo'),
      article_price: String(raw['article_price'] ?? raw['price'] ?? '0'),
    };
  }

  private normalizePendingUser(raw: Record<string, unknown>): PendingUserReport | null {
    const reportId = Number(raw['report_id'] ?? raw['id'] ?? raw['reportId']);
    if (!Number.isFinite(reportId) || reportId <= 0) return null;

    return {
      report_id: reportId,
      report_reason: String(raw['report_reason'] ?? raw['reason'] ?? ''),
      report_created_at: String(raw['report_created_at'] ?? raw['created_at'] ?? ''),
      reporter_username: String(
        raw['reporter_username'] ?? raw['reporter_name'] ?? raw['reporter_user_username'] ?? 'Usuario',
      ),
      reported_user_id: Number(raw['reported_user_id'] ?? raw['reportedUserId'] ?? 0),
      reported_username: String(
        raw['reported_username'] ?? raw['reported_user_username'] ?? raw['reported_name'] ?? 'Usuario',
      ),
    };
  }

  private normalizeHistoryItem(raw: Record<string, unknown>): ReportHistoryItem | null {
    const reportId = Number(raw['report_id'] ?? raw['id'] ?? raw['reportId']);
    if (!Number.isFinite(reportId) || reportId <= 0) return null;

    return {
      report_id: reportId,
      report_type: String(raw['report_type'] ?? raw['type'] ?? 'Articulo') as ReportHistoryItem['report_type'],
      report_reason: String(raw['report_reason'] ?? raw['reason'] ?? ''),
      resolution_note: String(raw['resolution_note'] ?? raw['moderator_note'] ?? ''),
      resolution_date: String(raw['resolution_date'] ?? raw['resolved_at'] ?? raw['updated_at'] ?? ''),
      moderator_username: String(raw['moderator_username'] ?? raw['moderator_name'] ?? ''),
      reporter_username: String(raw['reporter_username'] ?? raw['reporter_name'] ?? ''),
    };
  }

  private normalizeArticleDetail(response: unknown): ArticleReportDetail {
    const raw =
      response && typeof response === 'object'
        ? ((response as Record<string, unknown>)['reportArticle'] ?? response)
        : {};

    const item = raw as Record<string, unknown>;
    const photosRaw = item['photos'];
    const photos = Array.isArray(photosRaw)
      ? photosRaw.map((photo) => {
          const p = photo as Record<string, unknown>;
          return {
            id: Number(p['id'] ?? 0),
            url: String(p['url'] ?? ''),
            order: Number(p['order'] ?? 0),
          };
        })
      : [];

    return {
      report_id: Number(item['report_id'] ?? item['id'] ?? 0),
      reason: String(item['reason'] ?? item['report_reason'] ?? ''),
      created_at: String(item['created_at'] ?? item['report_created_at'] ?? ''),
      article_id: Number(item['article_id'] ?? 0),
      title: String(item['title'] ?? item['article_title'] ?? 'Artículo'),
      description: String(item['description'] ?? ''),
      price: String(item['price'] ?? item['article_price'] ?? '0'),
      condition: String(item['condition'] ?? ''),
      location: String(item['location'] ?? ''),
      previous_status: String(item['previous_status'] ?? ''),
      status: String(item['status'] ?? ''),
      seller_id: Number(item['seller_id'] ?? 0),
      seller_username: String(item['seller_username'] ?? ''),
      photos,
    };
  }

  private normalizeUserDetail(response: unknown): UserReportDetail {
    const raw =
      response && typeof response === 'object'
        ? ((response as Record<string, unknown>)['reportUser'] ?? response)
        : {};

    const item = raw as Record<string, unknown>;

    return {
      report_id: Number(item['report_id'] ?? item['id'] ?? 0),
      reason: String(item['reason'] ?? item['report_reason'] ?? ''),
      created_at: String(item['created_at'] ?? item['report_created_at'] ?? ''),
      reporter_user_id: Number(item['reporter_user_id'] ?? item['reporter_id'] ?? 0),
      reporter_user_username: String(
        item['reporter_user_username'] ?? item['reporter_username'] ?? item['reporter_name'] ?? '',
      ),
      reported_user_id: Number(item['reported_user_id'] ?? 0),
      reported_user_username: String(item['reported_user_username'] ?? item['reported_username'] ?? ''),
      reported_user_email: String(item['reported_user_email'] ?? item['email'] ?? ''),
      reported_user_avatar: String(item['reported_user_avatar'] ?? item['avatar_url'] ?? ''),
    };
  }

  private authHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
  }
}
