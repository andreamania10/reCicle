import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Auth } from '../../services/auth';

declare var bootstrap: any;

@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
})
export class RegisterComponent {
  registerData = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    location: '',
    acceptTerms: false,
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';
  isDetectingLocation = false;

  constructor(
    private router: Router,
    private auth: Auth,
  ) {}

  onSubmit(form: NgForm): void {
    if (form.invalid || this.passwordMismatch) {
      Object.values(form.controls).forEach((control) => control.markAsTouched());
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const { username, email, password, location } = this.registerData;

    this.auth
      .register({ username, email, password, location })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (user) => {
          this.closeModal();
          this.router.navigate(['/profile', user.id]);
        },
        error: (err: Error) => {
          this.errorMessage = err.message || 'Error al registrarse';
        },
      });
  }

  goToLogin(): void {
    this.closeModal();
    const loginEl = document.getElementById('loginModal');
    if (loginEl) {
      new bootstrap.Modal(loginEl).show();
    }
  }

  detectLocation(): void {
    if (!navigator.geolocation) {
      this.errorMessage = 'Tu navegador no soporta geolocalización.';
      return;
    }

    this.isDetectingLocation = true;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
          );
          const data = await response.json();
          const city =
            data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.county ||
            '';
          const state = data.address.state || '';
          this.registerData.location = city ? `${city}, ${state}` : state;
        } catch {
          this.errorMessage = 'No se pudo obtener la ubicación.';
        } finally {
          this.isDetectingLocation = false;
        }
      },
      () => {
        this.errorMessage = 'Permiso de ubicación denegado.';
        this.isDetectingLocation = false;
      },
    );
  }

  resetForm(): void {
    this.registerData = {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      location: '',
      acceptTerms: false,
    };
    this.isLoading = false;
    this.errorMessage = '';
    this.successMessage = '';
    this.isDetectingLocation = false;
  }

  private closeModal(): void {
    const modalEl = document.getElementById('registerModal');
    if (modalEl) {
      bootstrap.Modal.getInstance(modalEl)?.hide();
    }
  }

  get passwordMismatch(): boolean {
    return (
      this.registerData.password !== '' &&
      this.registerData.confirmPassword !== '' &&
      this.registerData.password !== this.registerData.confirmPassword
    );
  }
}
