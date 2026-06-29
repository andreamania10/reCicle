import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { User } from '../../interfaces/user';
import { Article } from '../../interfaces/article';
import { Auth } from '../../services/auth';

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
    readonly auth: Auth,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadProfileFromStorage();
  }

  logout(): void {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  getAvatarUrl(user: User): string {
    return user.avatar_url?.trim() || this.defaultAvatar;
  }

  displayValue(value?: string | null): string {
    return value?.trim() ? value.trim() : 'No disponible';
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


    // TODO: conectar con el servicio cuando esté disponible
    setTimeout(() => {
      this.isChangingPassword = false;
      this.passwordMessage = 'Contraseña actualizada correctamente.';
      form.resetForm();
      this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
    }, 800);
  }

  private loadProfileFromStorage(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    this.profile.set(this.auth.currentUser());
  }
}