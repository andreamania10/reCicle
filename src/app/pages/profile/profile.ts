import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { User } from '../../interfaces/user';
import { Article } from '../../interfaces/article';
import { Auth } from '../../services/auth';
import { UpdateProfilePayload, UserService } from '../../services/user';
import { ArticleService } from '../../services/article';

declare var bootstrap: any;

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  profile: User = {
    id: 0,
    username: '',
    email: '',
    role: '',
    avatar_url: null,
    location: '',
    avg_rating: '',
  };

  editData: UpdateProfilePayload = {
    username: '',
    email: '',
    location: '',
    avatar_url: '',
  };

  loadingProfile = true;
  profileError = '';
  isSavingProfile = false;
  profileMessage = '';
  profileSaveError = '';

  myArticles: Article[] = [];
  loadingArticles = true;
  articlesError = '';

  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  isChangingPassword = false;
  passwordMessage = '';
  passwordError = '';
  showPasswords = { current: false, new: false, confirm: false };
  showLogoutConfirm = false;

  constructor(
    private auth: Auth,
    private userService: UserService,
    private articleService: ArticleService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    this.loadProfile();
    this.loadMyArticles();
  }

  loadMyArticles(): void {
    const token = this.auth.currentUser()?.token;
    if (!token) {
      this.loadingArticles = false;
      return;
    }

    this.articleService.getMyArticles(token).subscribe({
      next: (articles) => {
        this.myArticles = articles;
        this.loadingArticles = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.articlesError = 'No se pudieron cargar tus artículos.';
        this.loadingArticles = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadProfile(): void {
    const sessionUser = this.auth.currentUser();
    if (!sessionUser?.token || !sessionUser.id) {
      this.profileError = 'Debes iniciar sesión para ver tu perfil.';
      this.loadingProfile = false;
      this.cdr.detectChanges();
      return;
    }

    this.loadingProfile = true;
    this.profileError = '';

    this.userService
      .getById(sessionUser.id)
      .pipe(
        finalize(() => {
          this.loadingProfile = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (user) => {
          this.applyProfile(user, sessionUser.token);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.applyProfile(sessionUser, sessionUser.token);
          this.profileError =
            err?.error?.message ||
            'No se pudo cargar tu perfil desde el servidor. Mostrando datos de sesión.';
          this.cdr.detectChanges();
        },
      });
  }

  saveProfile(form: NgForm): void {
    if (form.invalid) {
      Object.values(form.controls).forEach((control) => control.markAsTouched());
      return;
    }

    this.isSavingProfile = true;
    this.profileSaveError = '';
    this.profileMessage = '';

    const payload: UpdateProfilePayload = {
      username: this.editData.username.trim(),
      email: this.editData.email.trim(),
      location: this.editData.location.trim(),
      avatar_url: this.editData.avatar_url.trim(),
    };

    this.userService
      .updateProfile(payload)
      .pipe(
        finalize(() => {
          this.isSavingProfile = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (user) => {
          this.applyProfile(user);
          this.profileMessage = 'Perfil actualizado correctamente.';
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.profileSaveError =
            err?.error?.message || 'No se pudo actualizar el perfil.';
          this.cdr.detectChanges();
        },
      });
  }

  private applyProfile(user: User | null | undefined, token?: string): void {
    if (!user) return;

    const sessionToken = token ?? this.auth.currentUser()?.token;

    this.profile = { ...user, token: sessionToken };
    this.editData = {
      username: user.username ?? '',
      email: user.email ?? '',
      location: user.location ?? '',
      avatar_url: user.avatar_url ?? '',
    };

    if (sessionToken) {
      this.auth.setUser({ ...user, token: sessionToken });
    }
  }

  requestLogout(): void {
    this.showLogoutConfirm = true;
    this.cdr.detectChanges();
  }

  cancelLogout(): void {
    this.showLogoutConfirm = false;
    this.cdr.detectChanges();
  }

  confirmLogout(): void {
    this.showLogoutConfirm = false;
    this.auth.logout();
    this.router.navigate(['/']);
  }

  get passwordMismatch(): boolean {
    return (
      this.passwordData.newPassword !== '' &&
      this.passwordData.confirmPassword !== '' &&
      this.passwordData.newPassword !== this.passwordData.confirmPassword
    );
  }

  getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      Usuario: 'Usuario',
      Moderador: 'Moderador',
      Administrador: 'Administrador',
      buyer: 'Comprador',
      seller: 'Vendedor',
      moderator: 'Moderador',
      admin: 'Administrador',
    };
    return labels[role] || role;
  }

  togglePasswordVisibility(field: 'current' | 'new' | 'confirm'): void {
    this.showPasswords[field] = !this.showPasswords[field];
  }

  openPasswordConfirmModal(): void {
    const el = document.getElementById('passwordConfirmModal');
    if (el) new bootstrap.Modal(el).show();
  }

  confirmChangePassword(): void {
    const confirmEl = document.getElementById('passwordConfirmModal');
    if (confirmEl) bootstrap.Modal.getInstance(confirmEl)?.hide();

    setTimeout(() => {
      this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
      this.passwordError = '';
      this.passwordMessage = '';
      this.showPasswords = { current: false, new: false, confirm: false };
      const changeEl = document.getElementById('passwordChangeModal');
      if (changeEl) new bootstrap.Modal(changeEl).show();
    }, 300);
  }

  cancelPasswordChange(): void {
    const el = document.getElementById('passwordConfirmModal');
    if (el) bootstrap.Modal.getInstance(el)?.hide();
  }

  onChangePassword(form: NgForm): void {
    if (form.invalid || this.passwordMismatch) {
      Object.values(form.controls).forEach((control) => control.markAsTouched());
      return;
    }

    this.isChangingPassword = true;
    this.passwordError = '';
    this.passwordMessage = '';

    this.userService
      .updatePassword(this.passwordData.currentPassword, this.passwordData.newPassword)
      .subscribe({
        next: () => {
          this.isChangingPassword = false;
          this.passwordMessage = 'Contraseña actualizada correctamente.';
          form.resetForm();
          this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
          setTimeout(() => {
            const el = document.getElementById('passwordChangeModal');
            if (el) bootstrap.Modal.getInstance(el)?.hide();
            this.passwordMessage = '';
          }, 1800);
        },
        error: () => {
          this.isChangingPassword = false;
          this.passwordError =
            'No se pudo actualizar la contraseña. Verifica tu contraseña actual.';
        },
      });
  }
}
