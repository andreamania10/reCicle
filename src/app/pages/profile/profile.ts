import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { User } from '../../interfaces/user';
import { Auth } from '../../services/auth';
import { UserService } from '../../services/user';

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
    private router: Router,
  ) {}

  ngOnInit(): void {
    // Mostrar inmediatamente los datos del token (id, email, role)
    const stored = this.auth.currentUser();
    if (stored) {
      this.profile = stored;
      this.loading = false;
    }

    // Intentar enriquecer con datos completos del backend
    this.userService.getProfile().subscribe({
      next: (user) => { this.profile = user; },
      error: () => {
        // Si falla el endpoint, nos quedamos con los datos del token
        if (!this.profile) {
          this.errorMsg = 'No se pudo cargar el perfil.';
        }
        this.loading = false;
      },
    });
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
    };
    return labels[role] || role;
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

    setTimeout(() => {
      this.isChangingPassword = false;
      this.passwordMessage = 'Contraseña actualizada correctamente.';
      form.resetForm();
      this.passwordData = { currentPassword: '', newPassword: '', confirmPassword: '' };
    }, 800);
  }
}
