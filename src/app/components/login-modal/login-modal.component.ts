import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { Auth } from '../../services/auth';

declare var bootstrap: any;

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login-modal.component.html',
  styleUrl: './login-modal.component.css',
})
export class LoginModalComponent {
  loginData = { email: '', password: '' };
  errorMessage = signal('');
  isLoading = signal(false);
  showPassword = false;

  constructor(
    private router: Router,
    private auth: Auth,
  ) {}

  onSubmit(form: NgForm): void {
    if (form.invalid) {
      Object.values(form.controls).forEach((control) => control.markAsTouched());
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.auth
      .login(this.loginData)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (_user) => {
          this.closeModal();
          this.router.navigate(['/home']);
        },
        error: (err: Error) => {
          this.errorMessage.set(err.message || 'Error al iniciar sesión');
        },
      });
  }

  goToRegister(): void {
    const modalEl = document.getElementById('loginModal');
    if (modalEl) {
      bootstrap.Modal.getInstance(modalEl)?.hide();
    }
    const registerEl = document.getElementById('registerModal');
    if (registerEl) {
      new bootstrap.Modal(registerEl).show();
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private closeModal(): void {
    const modalEl = document.getElementById('loginModal');
    if (modalEl) {
      bootstrap.Modal.getInstance(modalEl)?.hide();
    }
  }

  resetForm(): void {
    this.loginData = { email: '', password: '' };
    this.errorMessage.set('');
    this.isLoading.set(false);
    this.showPassword = false;
  }
}
