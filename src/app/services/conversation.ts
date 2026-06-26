import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import { environment } from '../../environments/environment';
import { Conversation, ConversationInbox } from '../interfaces/conversation';

@Injectable({
  providedIn: 'root',
})
export class ConversationService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/conversations`;

  getInbox(token: string) {
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get<unknown>(this.apiUrl, { headers }).pipe(
      map((response) => {
        const list = Array.isArray(response)
          ? response
          : ((response as { results?: unknown[] })?.results ?? []);

        return list.map((item) =>
          this.normalizeInboxItem(item as Record<string, unknown>),
        );
      }),
    );
  }

  private normalizeInboxItem(item: Record<string, unknown>): ConversationInbox {
    return {
      conversation_id: Number(item['conversation_id'] ?? item['id']),
      article_id: Number(item['article_id']),
      buyer_id: Number(item['buyer_id']),
      seller_id: Number(item['seller_id']),
      created_at: String(item['created_at'] ?? ''),
      article_title: String(item['article_title'] ?? 'Artículo'),
      article_price: Number(item['article_price'] ?? 0),
      buyer_name: String(item['buyer_name'] ?? item['buyer_username'] ?? ''),
      seller_name: String(item['seller_name'] ?? item['seller_username'] ?? ''),
    };
  }

  startOrGet(articleId: number, token: string) {
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.post<Conversation>(this.apiUrl, { article_id: articleId }, { headers });
  }
}
