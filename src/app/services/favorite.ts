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

export type FavoriteCreatedResponse =
  | { id?: number; favoriteId?: number; favorite_id?: number; result?: { id?: number; favoriteId?: number; favorite_id?: number } }
  | Record<string, unknown>;

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
    return this.http.post<FavoriteCreatedResponse>(
      this.apiUrl,
      { user_id: userId, article_id: articleId },
      { headers },
    );
  }

  extractFavoriteId(response: FavoriteCreatedResponse | null | undefined): number | null {
    if (!response || typeof response !== 'object') return null;

    const root = response as Record<string, unknown>;
    const result = root['result'];
    const nested = result && typeof result === 'object' ? (result as Record<string, unknown>) : null;

    const candidates = [
      root['id'],
      root['favoriteId'],
      root['favorite_id'],
      nested?.['id'],
      nested?.['favoriteId'],
      nested?.['favorite_id'],
    ];

    for (const value of candidates) {
      const id = Number(value);
      if (Number.isInteger(id) && id > 0) return id;
    }

    return null;
  }

  findFavoriteIdForArticle(articleId: number, favorites: Favorite[]): number | null {
    const found = favorites.find(
      (favorite) => favorite.favoriteArticleId === articleId || favorite.articleId === articleId,
    );
    return found?.favoriteId ?? null;
  }

  remove(favoriteId: number, token: string) {
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.delete(`${this.apiUrl}/${favoriteId}`, { headers });
  }
}