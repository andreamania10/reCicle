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
