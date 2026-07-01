import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Article } from '../../../interfaces/article';
import { ArticlePhoto } from '../../../interfaces/article-photo';
import { User } from '../../../interfaces/user';
import { ArticleService } from '../../../services/article';
import { UserService } from '../../../services/user';
import { Auth } from '../../../services/auth';
import { ReportService } from '../../../services/report';
import { FavoriteService } from '../../../services/favorite';
import { ConversationService } from '../../../services/conversation';
import { RegisterComponent } from '../../../components/register/register.component';
import { CreateArticleReportPayload, CreateUserReportPayload } from '../../../interfaces/report';

declare var bootstrap: any;

@Component({
  selector: 'app-article-detail',
  imports: [CommonModule, RouterLink, FormsModule, RegisterComponent],
  templateUrl: './article-detail.html',
  styleUrl: './article-detail.css',
})

export class ArticleDetail implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private articleService = inject(ArticleService);
  private userService = inject(UserService);
  private auth = inject(Auth);
  private reportService = inject(ReportService);
  private favoriteService = inject(FavoriteService);
  private conversationService = inject(ConversationService);
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

  contactLoading = false;
  contactError = '';

  currentPhotoIndex = 0;

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.articleService.getById(id).subscribe({
      next: (data) => {
        this.article = data;
        this.currentPhotoIndex = 0;
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

  isOwner(): boolean {
    const currentUser = this.auth.currentUser();
    if (!currentUser || !this.article) return false;
    return currentUser.id === this.article.user_id;
  }

  goToEditArticle(): void {
    if (!this.article) return;
    this.router.navigate(['/articles/edit', this.article.id]);
  }

  isModeratorOrAdmin(): boolean {
  const currentUser = this.auth.currentUser();
  return currentUser?.role === 'Moderador' || currentUser?.role === 'Administrador';
  }

  goToModeratorPanel(): void {
  this.router.navigate(['/moderator']);
  }   

  isLoggedIn(): boolean {
    return this.auth.currentUser() !== null;
  }

  get articlePhotos(): { url: string }[] {
    if (!this.article) return [];

    if (this.article.photos?.length) {
      return [...this.article.photos]
        .sort((a, b) => a.order - b.order)
        .map((photo: ArticlePhoto) => ({ url: photo.url }));
    }

    const fallback = this.article.main_photo || this.article.image;
    if (fallback) return [{ url: fallback }];

    return [{ url: 'https://placehold.co/600x400' }];
  }

  prevPhoto(): void {
    const total = this.articlePhotos.length;
    if (total <= 1) return;
    this.currentPhotoIndex = (this.currentPhotoIndex - 1 + total) % total;
  }

  nextPhoto(): void {
    const total = this.articlePhotos.length;
    if (total <= 1) return;
    this.currentPhotoIndex = (this.currentPhotoIndex + 1) % total;
  }

  goToPhoto(index: number): void {
    if (index >= 0 && index < this.articlePhotos.length) {
      this.currentPhotoIndex = index;
    }
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
        const favoriteId = this.favoriteService.findFavoriteIdForArticle(
          this.article!.id,
          response.results,
        );

        if (favoriteId) {
          this.isFavorite = true;
          this.favoriteId = favoriteId;
        } else {
          this.isFavorite = false;
          this.favoriteId = null;
        }
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  private removeFavorite(token: string): void {
    const removeById = (favoriteId: number) => {
      this.favoriteService.remove(favoriteId, token).subscribe({
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
        },
      });
    };

    if (this.favoriteId) {
      removeById(this.favoriteId);
      return;
    }

    this.favoriteService.getUserFavorites(token).subscribe({
      next: (response) => {
        const favoriteId = this.favoriteService.findFavoriteIdForArticle(
          this.article!.id,
          response.results,
        );

        if (!favoriteId) {
          this.isFavorite = false;
          this.favoriteLoading = false;
          this.cdr.detectChanges();
          return;
        }

        this.favoriteId = favoriteId;
        removeById(favoriteId);
      },
      error: () => {
        this.favoriteError = 'No se pudo quitar de favoritos.';
        this.favoriteLoading = false;
        this.cdr.detectChanges();
      },
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

    const token = currentUser.token;

    if (this.isFavorite) {
      this.removeFavorite(token);
      return;
    }

    this.favoriteService.add(currentUser.id, this.article.id, token).subscribe({
      next: (created) => {
        this.isFavorite = true;
        this.favoriteId = this.favoriteService.extractFavoriteId(created);

        if (!this.favoriteId) {
          this.favoriteService.getUserFavorites(token).subscribe({
            next: (response) => {
              this.favoriteId = this.favoriteService.findFavoriteIdForArticle(
                this.article!.id,
                response.results,
              );
              this.favoriteLoading = false;
              this.cdr.detectChanges();
            },
            error: () => {
              this.favoriteLoading = false;
              this.cdr.detectChanges();
            },
          });
          return;
        }

        this.favoriteLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.favoriteError = 'No se pudo guardar en favoritos.';
        this.favoriteLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

handleFavoriteClick() {
  const currentUser = this.auth.currentUser();

  if (!currentUser?.token) {
    this.openLoginModal();
    return;
  }

  this.toggleFavorite();
}


handleContactClick() {
  const currentUser = this.auth.currentUser();

  if (!currentUser?.token) {
    this.openLoginModal();
    return;
  }

  if (!this.article) return;

  if (currentUser.id === this.article.user_id) {
    this.contactError = 'No puedes iniciar un chat contigo mismo.';
    this.cdr.detectChanges();
    return;
  }

  this.contactLoading = true;
  this.contactError = '';

  this.conversationService.startOrGet(this.article.id, currentUser.token).subscribe({
    next: (conversation) => {
      this.contactLoading = false;
      this.router.navigate(['/messages', conversation.id], {
        state: {
          chatContext: {
            partnerName: this.seller?.username?.trim() || '',
            articleTitle: this.article!.title,
            articlePrice: Number(this.article!.price),
            partnerId: this.seller?.id ?? conversation.seller_id,
          },
        },
      });
    },
    error: (err) => {
      this.contactLoading = false;
      this.contactError = err?.error?.message || 'No se pudo iniciar la conversación.';
      this.cdr.detectChanges();
    },
  });
}

openLoginModal(): void {
  const modalEl = document.getElementById('loginModal');
  if (modalEl) {
    new bootstrap.Modal(modalEl).show();
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

    const payload: CreateArticleReportPayload = {
      type: 'Articulo',
      article_id: this.article.id,
      reason: this.reportReason
    };

    this.reportService.reportArticle(payload, currentUser.token).subscribe({
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

    const payload: CreateUserReportPayload = {
      type: 'Usuario',
      reported_user_id: this.seller.id,
      reason: this.reportReason
    };

    this.reportService.reportUser(payload, currentUser.token).subscribe({
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