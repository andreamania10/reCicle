/** Categoría tal como la devuelve el backend (GET /api/categories) */
export interface Category {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
}

/** Respuesta de GET /api/categories */
export interface ApiCategoriesResponse {
  categories: Category[];
}
