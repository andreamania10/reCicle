import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  HostListener,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { NotificationItem } from '../../interfaces/notification';
import { Auth } from '../../services/auth';
import { NotificationService } from '../../services/notification';

@Component({
  selector: 'app-notification-bell',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-bell.html',
  styleUrl: './notification-bell.css',
})
export class NotificationBellComponent {
  readonly auth = inject(Auth);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  showDropdown = signal(false);
  selectedNotification = signal<NotificationItem | null>(null);
  markingAsRead = signal(false);

  notifications = this.notificationService.notifications;
  unreadCount = this.notificationService.unreadCount;
  loading = this.notificationService.loading;
  loadError = this.notificationService.loadError;

  constructor() {
    effect(() => {
      const user = this.auth.currentUser();
      const token = user?.token;
      if (user?.id && token) {
        untracked(() => this.notificationService.start(user.id, token));
      } else {
        untracked(() => this.notificationService.stop());
      }
    });

    effect(() => {
      this.notificationService.notifications();
      this.notificationService.unreadCount();
      this.notificationService.loading();
      this.notificationService.loadError();
      this.cdr.detectChanges();
    });
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.showDropdown.set(false);
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    const willOpen = !this.showDropdown();
    this.showDropdown.set(willOpen);
    if (willOpen) {
      this.notificationService.refresh();
    }
  }

  openNotification(notification: NotificationItem, event: Event): void {
    event.stopPropagation();
    this.showDropdown.set(false);
    this.selectedNotification.set(notification);

    const token = this.auth.currentUser()?.token;
    if (!token || notification.read) return;

    this.markingAsRead.set(true);

    this.notificationService.markAsRead(notification.id, token).subscribe({
      next: () => {
        this.markingAsRead.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.markingAsRead.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  closeModal(): void {
    this.selectedNotification.set(null);
  }
}
