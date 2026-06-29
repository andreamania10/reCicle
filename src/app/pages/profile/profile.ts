import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { User } from '../../interfaces/user';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  /** Datos quemados hasta tener el servicio de perfil */
  profile: User = {
    id: 1,
    username: 'recycle_user',
    email: 'usuario@correo.com',
    role: 'buyer',
    avatar_url:
      'https://ui-avatars.com/api/?name=Recycle+User&background=1a1a1a&color=fff&size=256',
    location: 'Madrid, España',
    avg_rating: '4.5',
  };

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
    private router: Router,
  ) {}

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
}
