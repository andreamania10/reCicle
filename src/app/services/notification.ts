import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { NotificationItem } from '../interfaces/notification';
import { SocketService } from './socket';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private http = inject(HttpClient);
  private socketService = inject(SocketService);
  private apiUrl = `${environment.apiUrl}/api/notifications`;
  private readonly pollIntervalMs = 30_000;

  private activeUserId: number | null = null;
  private activeToken: string | null = null;
  private pollTimer: ReturnType<typeof setInterval> | null = null;

  notifications = signal<NotificationItem[]>([]);
  loading = signal(false);
  loadError = signal('');
  unreadCount = computed(() => this.notifications().filter((item) => !item.read).length);

  private readonly onSocketNotification = (payload?: unknown) => {
    const item = this.normalizeSocketPayload(payload);
    if (item) {
      this.upsertNotification(item);
      return;
    }

    this.refresh({ silent: true });
  };

  refresh(options: { silent?: boolean } = {}): void {
    const token = this.activeToken;
    if (!token) return;

    if (!options.silent) {
      this.loading.set(true);
      this.loadError.set('');
    }

    this.getUnread(token).subscribe({
      next: (items) => {
        this.notifications.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        if (!options.silent) {
          this.notifications.set([]);
          this.loadError.set(
            err?.error?.message || 'No se pudieron cargar las notificaciones.',
          );
        }
        this.loading.set(false);
      },
    });
  }

  start(userId: number, token: string): void {
    const normalizedUserId = Number(userId);
    const isSameSession =
      this.activeUserId === normalizedUserId && this.activeToken === token;

    if (!isSameSession) {
      this.disconnectSocket();
      this.activeUserId = normalizedUserId;
      this.activeToken = token;

      this.socketService.connect();
      this.socketService.joinUserRoom(normalizedUserId);
      this.socketService.onNewNotification(this.onSocketNotification);
      this.startPolling();
    }

    this.refresh();
  }

  stop(): void {
    this.stopPolling();
    this.disconnectSocket();
    this.socketService.leaveUserRoom();
    this.activeUserId = null;
    this.activeToken = null;
    this.notifications.set([]);
    this.loading.set(false);
    this.loadError.set('');
  }

  private startPolling(): void {
    this.stopPolling();
    this.pollTimer = setInterval(() => this.refresh({ silent: true }), this.pollIntervalMs);
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private upsertNotification(item: NotificationItem): void {
    this.notifications.update((current) => {
      const withoutDuplicate = current.filter((entry) => entry.id !== item.id);
      return [item, ...withoutDuplicate];
    });
    this.loadError.set('');
  }

  private normalizeSocketPayload(payload: unknown): NotificationItem | null {
    if (!payload) return null;

    if (Array.isArray(payload)) {
      const first = payload.find(
        (item): item is Record<string, unknown> => !!item && typeof item === 'object',
      );
      return first ? this.normalizeNotification(first) : null;
    }

    if (typeof payload !== 'object') return null;

    const raw = payload as Record<string, unknown>;
    const nested = raw['notification'] ?? raw['notificacion'] ?? raw['data'];

    if (nested && typeof nested === 'object' && !Array.isArray(nested)) {
      return this.normalizeNotification(nested as Record<string, unknown>);
    }

    return this.normalizeNotification(raw);
  }

  private disconnectSocket(): void {
    this.socketService.offNewNotification(this.onSocketNotification);
  }

  getUnread(token: string): Observable<NotificationItem[]> {
    return this.http
      .get<unknown>(`${this.apiUrl}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        map((response) =>
          this.extractNotifications(response)
            .map((item) => this.normalizeNotification(item))
            .filter((item): item is NotificationItem => item !== null),
        ),
      );
  }

  markAsRead(notificationId: number, token: string): Observable<unknown> {
    return this.http
      .put(`${this.apiUrl}/${notificationId}/read`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .pipe(
        tap(() => {
          this.notifications.update((current) =>
            current.filter((item) => item.id !== notificationId),
          );
        }),
      );
  }

  private extractNotifications(response: unknown): Record<string, unknown>[] {
    if (Array.isArray(response)) {
      return response.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object');
    }

    if (!response || typeof response !== 'object') {
      return [];
    }

    const obj = response as Record<string, unknown>;

    for (const key of ['result', 'results', 'data', 'notifications', 'notificaciones', 'items']) {
      const value = obj[key];
      if (Array.isArray(value)) {
        return value.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object');
      }
    }

    return [];
  }

  private normalizeNotification(raw: Record<string, unknown>): NotificationItem | null {
    const id = Number(
      raw['id'] ?? raw['notification_id'] ?? raw['id_notificacion'] ?? raw['notificationId'],
    );
    if (!Number.isFinite(id) || id <= 0) return null;

    const readValue = raw['read'] ?? raw['leido'] ?? raw['is_read'] ?? raw['isRead'] ?? false;
    const isRead = readValue === true || readValue === 1 || readValue === '1';

    if (isRead) return null;

    return {
      id,
      user_id: Number(raw['user_id'] ?? raw['id_usuario'] ?? 0) || undefined,
      title: String(
        raw['title'] ?? raw['titulo'] ?? this.formatNotificationType(raw['type']) ?? 'Notificación',
      ),
      message: String(
        raw['message'] ?? raw['mensaje'] ?? raw['body'] ?? raw['content'] ?? '',
      ),
      read: isRead,
      type: raw['type'] ? String(raw['type'] ?? raw['tipo']) : undefined,
      reference_id:
        raw['reference_id'] != null || raw['id_referencia'] != null
          ? Number(raw['reference_id'] ?? raw['id_referencia'])
          : undefined,
      created_at: String(raw['created_at'] ?? raw['fecha'] ?? ''),
    };
  }

  private formatNotificationType(type: unknown): string {
    if (!type) return 'Notificación';

    return String(type)
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/^\w/, (char) => char.toUpperCase());
  }
}
