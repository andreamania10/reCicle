import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Favorite {
  favoriteId: number;
  favoriteUserId: number;
  favoriteArticleId: number;
  articleId: number;
  ownerArticleId: number;
  title: string;
  price: string;
  condition: string;
  status: string;
  location: string;
  category: {
    id: number;
    name: string;
    slug: string;
  };
  photos: {
    id: number;
    url: string;
    order: number;
  }[];
}

export interface FavoriteResponse {
  results: Favorite[];
}

@Injectable({
  providedIn: 'root'
})
export class FavoriteService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/favorites`;

  getUserFavorites(token: string) {
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get<FavoriteResponse>(`${this.apiUrl}/user`, { headers });
  }

  add(userId: number, articleId: number, token: string) {
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.post<{ id: number }>(this.apiUrl, { user_id: userId, article_id: articleId }, { headers });
  }

  remove(favoriteId: number, token: string) {
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.delete(`${this.apiUrl}/${favoriteId}`, { headers });
  }
}