import { ArticlePhoto } from "./article-photo";

export interface Article {
  id: number;
  user_id: number;
  category_id: number;
  title: string;
  price: string | number;
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
  photos?: ArticlePhoto[];
}

export interface ArticlesResponse {
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