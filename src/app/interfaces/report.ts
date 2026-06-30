export type ReportType = 'Articulo' | 'Usuario';

export interface CreateArticleReportPayload {
  type: 'Articulo';
  article_id: number;
  reason: string;
}

export interface CreateUserReportPayload {
  type: 'Usuario';
  reported_user_id: number;
  reason: string;
}

export type CreateReportPayload = CreateArticleReportPayload | CreateUserReportPayload;

export interface PendingArticleReport {
  report_id: number;
  report_reason: string;
  report_created_at: string;
  reporter_username: string;
  article_id: number;
  article_title: string;
  article_price: string;
}

export interface PendingUserReport {
  report_id: number;
  report_reason: string;
  report_created_at: string;
  reporter_username: string;
  reported_user_id: number;
  reported_username: string;
}

export interface PendingArticlesResponse {
  results: PendingArticleReport[];
}

export interface PendingUsersResponse {
  results: PendingUserReport[];
}

export interface ArticleReportDetail {
  report_id: number;
  reason: string;
  created_at: string;
  article_id: number;
  title: string;
  description: string;
  price: string;
  condition: string;
  location: string;
  previous_status: string;
  status: string;
  seller_id: number;
  seller_username: string;
  photos: { id: number; url: string; order: number }[];
}

export interface UserReportDetail {
  report_id: number;
  reason: string;
  created_at: string;
  reporter_user_id: number;
  reporter_user_username: string;
  reported_user_id: number;
  reported_user_username: string;
  reported_user_email: string;
  reported_user_avatar: string;
}

export interface ReportHistoryItem {
  report_id: number;
  report_type: ReportType;
  report_reason: string;
  resolution_note: string;
  resolution_date: string;
  moderator_username: string;
  reporter_username: string;
}

export interface ReportsHistoryResponse {
  results: ReportHistoryItem[];
}

export interface ResolveReportPayload {
  action: 'accept' | 'reject';
  moderator_note: string;
}
