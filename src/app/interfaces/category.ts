export interface Category {
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  created_at?: string;
}
export interface CategoryResponse {
  categories: Category[];
}