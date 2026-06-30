export interface Report {
  // Identificadores del reporte
  report_id?: number;
  id?: number;
  reportId?: number;

  // Motivo / fecha
  report_reason?: string;
  reason?: string;
  motivo?: string;
  report_created_at?: string;
  created_at?: string;
  fecha?: string;

  // Artículos
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

  // Usuarios
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

  // Campos genéricos / alternativos del backend
  target_id?: number;
  targetId?: number;

  // Posibles campos ya agrupados desde backend
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