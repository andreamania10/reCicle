export type ReportType = 'Articulo' | 'Usuario';

export interface Report {
  report_id?: number;
  id?: number;
  reportId?: number;
  report_reason?: string;
  reason?: string;
  motivo?: string;
  report_created_at?: string;
  created_at?: string;
  fecha?: string;
  article_id?: number;
  articulo_id?: number;
  articleId?: number;
  reported_article_id?: number;
  article_title?: string;
  title?: string;
  titulo?: string;
  article?: {
    id?: number;
    title?: string;
    titulo?: string;
  };
  user_id?: number;
  usuario_id?: number;
  reported_user_id?: number;
  username?: string;
  name?: string;
  nombre?: string;
  user?: {
    id?: number;
    username?: string;
    name?: string;
    nombre?: string;
  };
  usuario?: {
    id?: number;
    username?: string;
    name?: string;
    nombre?: string;
  };
  target_id?: number;
  targetId?: number;
  totalReportes?: number;
  reportsCount?: number;
  total_reports?: number;
  reportIds?: number[];
  motivos?: string[];
}

export type ApiListResponse<T> =
  | T[]
  | {
      data?: T[];
      reports?: T[];
      results?: T[];
      items?: T[];
    };

export interface GrupoArticulo {
  targetId: number;
  titulo: string;
  totalReportes: number;
  motivos: string[];
  reportIds: number[];
}

export interface GrupoUsuario {
  targetId: number;
  nombre: string;
  totalReportes: number;
  motivos: string[];
  reportIds: number[];
}

export interface HistoricoItem {
  tipo?: string;
  type?: string;
  accion?: string;
  resultado?: string;
  result?: string;
  estado?: string;
  fecha?: string;
  created_at?: string;
  updated_at?: string;
}

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
