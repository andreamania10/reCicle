import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Article } from '../../../interfaces/article';
import { User } from '../../../interfaces/user';
import { ArticleService } from '../../../services/article';
import { UserService } from '../../../services/user';
import { Auth } from '../../../services/auth';
import { ReportService } from '../../../services/report';
import { FavoriteService } from '../../../services/favorite';

@Component({
  selector: 'app-article-detail',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './article-detail.html',
  styleUrl: './article-detail.css',
})
export class ArticleDetail implements OnInit {

  private route = inject(ActivatedRoute);
  private articleService = inject(ArticleService);
  private userService = inject(UserService);
  private auth = inject(Auth);
  private reportService = inject(ReportService);
  private favoriteService = inject(FavoriteService);
  private cdr = inject(ChangeDetectorRef);

  article: Article | null = null;
  seller: User | null = null;
  loading = true;
  notFound = false;

  statusOptions = ['Borrador', 'Publicado', 'En revisión', 'Retirado', 'Vendido'];
  newStatus: string = '';
  updatingStatus = false;
  statusError = '';

  // Reportes
  showReportArticleForm = false;
  showReportUserForm = false;
  reportReason = '';
  sendingReport = false;
  reportSuccess = '';
  reportError = '';

  // Favoritos
  isFavorite = false;
  favoriteId: number | null = null;
  favoriteLoading = false;
  favoriteError = '';

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.articleService.getById(id).subscribe({
      next: (data) => {
        this.article = data;
        this.newStatus = data.status || '';
        this.loading = false;
        this.loadSeller(data.user_id);
        this.checkIfFavorite();
        this.cdr.detectChanges();
      },
      error: () => {
        this.notFound = true;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadSeller(userId: number) {
  this.userService.getById(userId).subscribe({
    next: (user) => {
      this.seller = user;
      this.cdr.detectChanges();
    },
    error: () => {
      this.seller = null;
      this.cdr.detectChanges();
    }
  });
  }

  canEditStatus(): boolean {
    const currentUser = this.auth.currentUser();
    if (!currentUser || !this.article) return false;

    const isOwner = currentUser.id === this.article.user_id;
    const isStaff = currentUser.role === 'Moderador' || currentUser.role === 'Administrador';

    return isOwner || isStaff;
  }

  isLoggedIn(): boolean {
    return this.auth.currentUser() !== null;
  }

  updateStatus() {
    if (!this.article) return;

    const currentUser = this.auth.currentUser();
    if (!currentUser?.token) {
      this.statusError = 'Debes iniciar sesión para hacer esto.';
      return;
    }

    this.updatingStatus = true;
    this.statusError = '';

    this.articleService.updateStatus(this.article.id, this.newStatus, currentUser.token).subscribe({
      next: (updated) => {
        if (this.article) {
          this.article.status = updated.status || this.newStatus;
        }
        this.updatingStatus = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.statusError = 'No se pudo actualizar el estado.';
        this.updatingStatus = false;
        this.cdr.detectChanges();
      }
    });
  }

  checkIfFavorite() {
    const currentUser = this.auth.currentUser();
    if (!currentUser?.token || !this.article) return;

    this.favoriteService.getUserFavorites(currentUser.token).subscribe({
      next: (response) => {
        console.log('Favoritos recibidos:', response);
        console.log('Buscando article.id:', this.article!.id);
        const found = response.results.find(f => f.favoriteArticleId === this.article!.id);
        console.log('Encontrado:', found);
        if (found) {
          this.isFavorite = true;
          this.favoriteId = found.favoriteId;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.log('ERROR checkIfFavorite:', err.error);
      }
    });
  }

  toggleFavorite() {
    if (!this.article) return;

    const currentUser = this.auth.currentUser();
    if (!currentUser?.token) {
      this.favoriteError = 'Debes iniciar sesión para guardar favoritos.';
      return;
    }

    this.favoriteLoading = true;
    this.favoriteError = '';

    if (this.isFavorite && this.favoriteId) {
      this.favoriteService.remove(this.favoriteId, currentUser.token).subscribe({
        next: () => {
          this.isFavorite = false;
          this.favoriteId = null;
          this.favoriteLoading = false;
          this.cdr.detectChanges();
        },
        error: () => {
          this.favoriteError = 'No se pudo quitar de favoritos.';
          this.favoriteLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.favoriteService.add(currentUser.id, this.article.id, currentUser.token).subscribe({
        next: (created) => {
          this.isFavorite = true;
          this.favoriteId = created.id;
          this.favoriteLoading = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.log('ERROR FAVORITOS:', err.error);
          this.favoriteError = 'No se pudo guardar en favoritos.';
          this.favoriteLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  openReportArticle() {
    this.showReportArticleForm = true;
    this.showReportUserForm = false;
    this.reportReason = '';
    this.reportSuccess = '';
    this.reportError = '';
  }

  openReportUser() {
    this.showReportUserForm = true;
    this.showReportArticleForm = false;
    this.reportReason = '';
    this.reportSuccess = '';
    this.reportError = '';
  }

  cancelReport() {
    this.showReportArticleForm = false;
    this.showReportUserForm = false;
  }

  submitReportArticle() {
    if (!this.article) return;

    const currentUser = this.auth.currentUser();
    if (!currentUser?.token) {
      this.reportError = 'Debes iniciar sesión para reportar.';
      return;
    }

    this.sendingReport = true;
    this.reportError = '';

    this.reportService.reportArticle({
      type: 'Articulo',
      article_id: this.article.id,
      reason: this.reportReason
    }, currentUser.token).subscribe({
      next: () => {
        this.reportSuccess = 'Artículo reportado correctamente.';
        this.sendingReport = false;
        this.showReportArticleForm = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.reportError = 'No se pudo enviar el reporte.';
        this.sendingReport = false;
        this.cdr.detectChanges();
      }
    });
  }

  submitReportUser() {
    if (!this.article || !this.seller) return;

    const currentUser = this.auth.currentUser();
    if (!currentUser?.token) {
      this.reportError = 'Debes iniciar sesión para reportar.';
      return;
    }

    this.sendingReport = true;
    this.reportError = '';

    this.reportService.reportUser({
      type: 'Usuario',
      reported_user_id: this.seller.id,
      article_id: this.article.id,
      reason: this.reportReason
    }, currentUser.token).subscribe({
      next: () => {
        this.reportSuccess = 'Usuario reportado correctamente.';
        this.sendingReport = false;
        this.showReportUserForm = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.reportError = 'No se pudo enviar el reporte.';
        this.sendingReport = false;
        this.cdr.detectChanges();
      }
    });
  }
}