export interface Article {
  id: number;
  user_id: number;
  category_id: number;
  title: string;
  description: string;
  price: number;
  condition: string;
  status: string;
  location: string;
  image?: string;
  main_photo?: string;
  created_at?: string;
  updated_at?: string;
}
export interface ArticleResponse {
  info: {
    page: number;
    pageSize: number;
    count: number;
  };
  results: Article[];
}