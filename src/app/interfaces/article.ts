export interface Article {
  id: number;
  title: string;
  category: string;
  price: number;
  image: string;
  description?: string;
  status?: string;
  userId?: number;
}

/** Artículo tal como lo devuelve el backend (GET /api/articles) */
export interface ApiArticle {
  id: number;
  user_id: number;
  category_id: number;
  title: string;
  description: string;
  price: string | number;
  condition: string;
  status: string;
  location: string;
  created_at: string;
  updated_at: string;
  main_photo: string | null;
}

/** Respuesta paginada de GET /api/articles */
export interface ApiArticlesResponse {
  info: {
    page: number;
    pageSize: number;
    count: number;
  };
  results: ApiArticle[];
}
