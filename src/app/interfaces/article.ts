export interface Article {
  id: number;
  title: string;
  price: string | number;
  user_id?: number;
  category_id?: number;
  description?: string;
  condition?: string;
  status?: string;
  location?: string;
  created_at?: string;
  updated_at?: string;
  main_photo?: string;
  category?: string;
  image?: string;
  userId?: number;
}

export interface ArticlesResponse {
  info: {
    page: number;
    pageSize: number;
    count: number;
  };
  results: Article[];
}
