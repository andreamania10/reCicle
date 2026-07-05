import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../environments/environment';
import { ChatMessage, PrivateMessagePayload } from '../interfaces/message';

const NOTIFICATION_EVENTS = [
  'new_notification',
  'nueva_notificacion',
  'notification',
  'notificacion',
] as const;

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket | null = null;
  private activeUserId: number | null = null;
  private readonly onSocketConnect = () => {
    if (this.activeUserId != null) {
      this.socket?.emit('join_user', this.activeUserId);
    }
  };

  connect(): Socket {
    if (!this.socket) {
      this.socket = io(environment.apiUrl, {
        autoConnect: true,
        transports: ['websocket', 'polling'],
      });
      this.socket.on('connect', this.onSocketConnect);
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

  joinUserRoom(userId: number): void {
    this.activeUserId = Number(userId);
    const socket = this.connect();

    if (socket.connected) {
      socket.emit('join_user', this.activeUserId);
    }
  }

  leaveUserRoom(): void {
    this.activeUserId = null;
  }

  onNewNotification(handler: (notification: unknown) => void): void {
    const socket = this.connect();
    for (const eventName of NOTIFICATION_EVENTS) {
      socket.on(eventName, handler);
    }
  }

  offNewNotification(handler?: (notification: unknown) => void): void {
    if (!this.socket) return;

    if (handler) {
      for (const eventName of NOTIFICATION_EVENTS) {
        this.socket.off(eventName, handler);
      }
      return;
    }

    for (const eventName of NOTIFICATION_EVENTS) {
      this.socket.off(eventName);
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.off('connect', this.onSocketConnect);
      this.socket.disconnect();
    }

    this.socket = null;
    this.activeUserId = null;
  }
}
