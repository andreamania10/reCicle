import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { User } from '../../interfaces/user';
import { Article } from '../../interfaces/article';
import { Auth } from '../../services/auth';
import { UserService } from '../../services/user';
import { ArticleService } from '../../services/article';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  profile: User | null = null;
  loading = true;
  errorMsg = '';

  // Artículos del usuario
  userArticles: Article[] = [];
  loadingArticles = true;
  articlesError = '';

  // Modales de contraseña
  showConfirmModal = false;
  showPasswordModal = false;

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
  isChangingPassword = false;
  passwordMessage = '';
  passwordError = '';
  showPasswords = { current: false, new: false, confirm: false };

  constructor(
    private auth: Auth,
    private userService: UserService,
    private articleService: ArticleService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const stored = this.auth.currentUser();

    // Mostrar inmediatamente lo que hay en localStorage (evita pantalla de carga infinita)
    if (stored) {
      this.profile = stored;
      this.loading = false;
      this.loadMyArticles();
    }

    // Enriquecer con datos completos del backend (username, location, avatar_url…)
    // El endpoint puede tardar en Render — la página ya es usable mientras carga
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.profile = { ...user, token: stored?.token };
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        if (!this.profile) {
          this.errorMsg = 'No se pudo cargar el perfil.';
        }
      },
    });
  }

  private loadMyArticles(): void {
    const token = this.profile?.token ?? '';
    if (!token) {
      this.loadingArticles = false;
      return;
    }
    this.articleService.getMyArticles(token).subscribe({
      next: (articles) => {
        this.userArticles = articles;
        this.loadingArticles = false;
      },
      error: () => {
        this.articlesError = 'No se pudieron cargar tus artículos.';
        this.loadingArticles = false;
      },
    });
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  // ── Modales de contraseña ────────────────────────────────

  openConfirmModal(): void {
    this.showConfirmModal = true;
  }

  confirmChangePassword(): void {
    this.showConfirmModal = false;
    this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
    this.passwordMessage = '';
    this.passwordError = '';
    this.showPasswords = { current: false, new: false, confirm: false };
    this.showPasswordModal = true;
  }

  cancelConfirmModal(): void {
    this.showConfirmModal = false;
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.passwordMessage = '';
    this.passwordError = '';
  }

  get passwordMismatch(): boolean {
    return (
      this.passwordData.newPassword !== '' &&
      this.passwordData.confirmPassword !== '' &&
      this.passwordData.newPassword !== this.passwordData.confirmPassword
    );
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    this.showPasswords[field] = !this.showPasswords[field];
  }

  onChangePassword(form: NgForm): void {
    if (form.invalid || this.passwordMismatch) {
      Object.values(form.controls).forEach((control) => control.markAsTouched());
      return;
    }

    this.isChangingPassword = true;
    this.passwordError = '';
    this.passwordMessage = '';

    this.userService.updatePassword(
      this.passwordData.currentPassword,
      this.passwordData.newPassword
    ).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.passwordMessage = 'Contraseña actualizada correctamente.';
        form.resetForm();
        this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
        setTimeout(() => this.closePasswordModal(), 1500);
      },
      error: (err: any) => {
        this.isChangingPassword = false;
        this.passwordError =
          err?.error?.message || 'No se pudo actualizar la contraseña.';
      },
    });
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      Usuario: 'Usuario',
      Moderador: 'Moderador',
      Administrador: 'Administrador',
    };
    return labels[role] || role;
  }

  getArticleImage(article: Article): string {
    return article.main_photo ?? article.image ?? '';
  }
}
