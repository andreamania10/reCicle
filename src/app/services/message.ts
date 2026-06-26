import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ChatMessage } from '../interfaces/message';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/messages`;

  getHistory(conversationId: number, token: string) {
    const headers = { Authorization: `Bearer ${token}` };
    return this.http.get<ChatMessage[]>(`${this.apiUrl}/${conversationId}`, { headers });
  }
}
