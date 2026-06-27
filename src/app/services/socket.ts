import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { ChatMessage, PrivateMessagePayload } from '../interfaces/message';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(environment.apiUrl, { autoConnect: true });
    } else if (!this.socket.connected) {
      this.socket.connect();
    }

    return this.socket;
  }

  joinChat(conversationId: number): void {
    this.connect().emit('join_chat', conversationId);
  }

  sendPrivateMessage(payload: PrivateMessagePayload): void {
    this.connect().emit('private_message', payload);
  }

  onNewMessage(handler: (message: ChatMessage) => void): void {
    this.connect().on('new_message', handler);
  }

  offNewMessage(handler?: (message: ChatMessage) => void): void {
    if (!this.socket) return;

    if (handler) {
      this.socket.off('new_message', handler);
      return;
    }

    this.socket.off('new_message');
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
  }
}
