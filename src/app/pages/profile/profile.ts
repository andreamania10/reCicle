import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { User } from '../../interfaces/user';
import { Article } from '../../interfaces/article';
import { Auth } from '../../services/auth';
<<<<<<< HEAD
<<<<<<< HEAD
import { UserService } from '../../services/user';
import { ArticleService } from '../../services/article';
=======
>>>>>>> 35a467a (feat: perfil desde sesión local y login con datos completos del usuario)
=======
>>>>>>> origin/main

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  readonly defaultAvatar = '/assets/imagenes/sin_foto.png';

  profile = signal<User | null>(null);
<<<<<<< HEAD

  // Artículos del usuario
  userArticles: Article[] = [];
  loadingArticles = true;
  articlesError = '';

  // Modales de contraseña
  showConfirmModal = false;
  showPasswordModal = false;
=======
>>>>>>> origin/main

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
<<<<<<< HEAD
<<<<<<< HEAD
    private auth: Auth,
    private userService: UserService,
    private articleService: ArticleService,
=======
    readonly auth: Auth,
>>>>>>> 35a467a (feat: perfil desde sesión local y login con datos completos del usuario)
=======
    readonly auth: Auth,
>>>>>>> origin/main
    private router: Router,
  ) {}

  ngOnInit(): void {
<<<<<<< HEAD
<<<<<<< HEAD
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
=======
    this.loadProfileFromStorage();
>>>>>>> origin/main
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
=======
    this.loadProfileFromStorage();
>>>>>>> 35a467a (feat: perfil desde sesión local y login con datos completos del usuario)
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

<<<<<<< HEAD
<<<<<<< HEAD
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
=======
=======
>>>>>>> origin/main
  getAvatarUrl(user: User): string {
    return user.avatar_url?.trim() || this.defaultAvatar;
  }

  displayValue(value?: string | null): string {
    return value?.trim() ? value.trim() : 'No disponible';
<<<<<<< HEAD
>>>>>>> 35a467a (feat: perfil desde sesión local y login con datos completos del usuario)
=======
>>>>>>> origin/main
  }

  get passwordMismatch(): boolean {
    return (
      this.passwordData.newPassword !== '' &&
      this.passwordData.confirmPassword !== '' &&
      this.passwordData.newPassword !== this.passwordData.confirmPassword
    );
  }

<<<<<<< HEAD
=======
  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      Usuario: 'Usuario',
      buyer: 'Comprador',
      seller: 'Vendedor',
      Moderador: 'Moderador',
      Administrador: 'Administrador',
    };
    return labels[role] || role;
  }

>>>>>>> 35a467a (feat: perfil desde sesión local y login con datos completos del usuario)
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

<<<<<<< HEAD
<<<<<<< HEAD
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
=======
=======
>>>>>>> origin/main
    // TODO: conectar con el servicio cuando esté disponible
    setTimeout(() => {
      this.isChangingPassword = false;
      this.passwordMessage = 'Contraseña actualizada correctamente.';
      form.resetForm();
      this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
    }, 800);
>>>>>>> 35a467a (feat: perfil desde sesión local y login con datos completos del usuario)
  }

  private loadProfileFromStorage(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    this.profile.set(this.auth.currentUser());
  }

  private loadProfileFromStorage(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    this.profile.set(this.auth.currentUser());
  }
}
