import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { User } from '../../interfaces/user';
import { Article } from '../../interfaces/article';
import { Auth } from '../../services/auth';
import { UserService } from '../../services/user';
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

  constructor(
    private auth: Auth,
    private userService: UserService,
    private articleService: ArticleService,
    private router: Router,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    const currentUser = this.auth.currentUser();
    if (!currentUser) {
      this.router.navigate(['/']);
      return;
    }

    // Cargar datos reales del perfil
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.profile = { ...user, token: currentUser.token };
        this.cdr.detectChanges();
      },
      error: () => {
        this.profile = currentUser;
        this.cdr.detectChanges();
      },
    });

    // Cargar mis artículos (en paralelo con getProfile)
    const token = currentUser.token;
    if (token) {
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
    } else {
      this.loadingArticles = false;
      this.cdr.detectChanges();
    }
  }

  logout(): void {
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

  // Abre el primer pop up de confirmación
  openPasswordConfirmModal(): void {
    const el = document.getElementById('passwordConfirmModal');
    if (el) new bootstrap.Modal(el).show();
  }

  // Desde el pop up de confirmación → "Sí, quiero"
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

  // Desde el pop up de confirmación → "No"
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
