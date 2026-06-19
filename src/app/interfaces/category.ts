export interface Category {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  parent_id: number | null;
}

export interface CategoriesResponse {
  categories: Category[];
}

