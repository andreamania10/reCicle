import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  ArticleReportDetail,
  PendingArticleReport,
  PendingUserReport,
  ReportHistoryItem,
  UserReportDetail,
} from '../../interfaces/report';
import { Auth } from '../../services/auth';
import { ReportService } from '../../services/report';

type ReportsTab = 'articles' | 'users' | 'history';

@Component({
  selector: 'app-moderator-panel',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './moderator-panel.html',
  styleUrls: ['./moderator-panel.css']
})
export class ModeratorPanel implements OnInit {
  private auth = inject(Auth);
  private reportService = inject(ReportService);
  private cdr = inject(ChangeDetectorRef);

  activeTab = signal<ReportsTab>('articles');
  loading = signal(false);
  resolving = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  pendingArticles = signal<PendingArticleReport[]>([]);
  pendingUsers = signal<PendingUserReport[]>([]);
  history = signal<ReportHistoryItem[]>([]);

  selectedArticleReport = signal<ArticleReportDetail | null>(null);
  selectedUserReport = signal<UserReportDetail | null>(null);
  moderatorNote = '';

  ngOnInit(): void {
    this.auth.isLoggedIn();
    this.loadActiveTab();
  }

  setTab(tab: ReportsTab): void {
    this.activeTab.set(tab);
    this.closeDetail();
    this.clearMessages();
    this.loadActiveTab();
  }

  openArticleDetail(report: PendingArticleReport): void {
    const token = this.auth.currentUser()?.token;
    if (!token) return;

    this.loading.set(true);
    this.errorMessage.set('');

    this.reportService.getPendingArticleDetail(report.report_id, token).subscribe({
      next: (detail) => {
        this.selectedArticleReport.set(detail);
        this.selectedUserReport.set(null);
        this.moderatorNote = '';
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el detalle del reporte.');
        this.loading.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  openUserDetail(report: PendingUserReport): void {
    const token = this.auth.currentUser()?.token;
    if (!token) return;

    this.loading.set(true);
    this.errorMessage.set('');

    this.reportService.getPendingUserDetail(report.report_id, token).subscribe({
      next: (detail) => {
        this.selectedUserReport.set(detail);
        this.selectedArticleReport.set(null);
        this.moderatorNote = '';
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage.set('No se pudo cargar el detalle del reporte.');
        this.loading.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  closeDetail(): void {
    this.selectedArticleReport.set(null);
    this.selectedUserReport.set(null);
    this.moderatorNote = '';
  }

  resolveArticleReport(action: 'accept' | 'reject'): void {
    const report = this.selectedArticleReport();
    this.resolveReportById(report?.report_id, action);
  }

  resolveUserReport(action: 'accept' | 'reject'): void {
    const report = this.selectedUserReport();
    this.resolveReportById(report?.report_id, action);
  }

  private resolveReportById(reportId: number | undefined, action: 'accept' | 'reject'): void {
    const token = this.auth.currentUser()?.token;
    if (!token || !reportId || !this.moderatorNote.trim()) return;

    this.resolving.set(true);
    this.errorMessage.set('');

    const request =
      action === 'accept'
        ? this.reportService.acceptReport(reportId, this.moderatorNote.trim(), token)
        : this.reportService.rejectReport(reportId, this.moderatorNote.trim(), token);

    request.subscribe({
      next: () => {
        const message =
          action === 'accept'
            ? 'Reporte aceptado. El artículo ha sido retirado.'
            : 'Reporte rechazado. El artículo mantiene su estado.';
        this.successMessage.set(message);
        this.resolving.set(false);
        this.closeDetail();
        this.loadActiveTab();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage.set(err?.error?.message || 'No se pudo resolver el reporte.');
        this.resolving.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  private loadActiveTab(): void {
    const token = this.auth.currentUser()?.token;
    if (!token) return;

    this.loading.set(true);
    this.errorMessage.set('');

    const tab = this.activeTab();

    if (tab === 'articles') {
      this.reportService.getPendingArticles(token).subscribe({
        next: (reports) => {
          this.pendingArticles.set(reports);
          this.loading.set(false);
          this.cdr.detectChanges();
        },
        error: (err) =>
          this.handleLoadError(
            err?.error?.message || 'No se pudieron cargar los reportes de artículos.',
          ),
      });
      return;
    }

    if (tab === 'users') {
      this.reportService.getPendingUsers(token).subscribe({
        next: (reports) => {
          this.pendingUsers.set(reports);
          this.loading.set(false);
          this.cdr.detectChanges();
        },
        error: (err) =>
          this.handleLoadError(
            err?.error?.message || 'No se pudieron cargar los reportes de usuarios.',
          ),
      });
      return;
    }

    this.reportService.getHistory(token).subscribe({
      next: (reports) => {
        this.history.set(reports);
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      error: (err) =>
        this.handleLoadError(err?.error?.message || 'No se pudo cargar el historial de reportes.'),
    });
  }

  private handleLoadError(message: string): void {
    this.errorMessage.set(message);
    this.loading.set(false);
    this.cdr.detectChanges();
  }

  private clearMessages(): void {
    this.successMessage.set('');
    this.errorMessage.set('');
  }
}
