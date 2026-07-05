import { CommonModule } from '@angular/common';
import { Component, signal, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { LegalModalsComponent } from '../legal-modals/legal-modals';
import { Auth } from '../../services/auth';

declare var bootstrap: any;

@Component({
  selector: 'app-register-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, LegalModalsComponent],
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

  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');
  isDetectingLocation = signal(false);
  legalModals = viewChild.required(LegalModalsComponent);

  constructor(
    private router: Router,
    private auth: Auth,
  ) {}

  onSubmit(form: NgForm): void {
    if (form.invalid || this.passwordMismatch) {
      Object.values(form.controls).forEach((control) => control.markAsTouched());
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { username, email, password, location } = this.registerData;

    this.auth
      .register({ username, email, password, location })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (user) => {
          this.closeModal();
          this.router.navigate(['/home']);
        },
        error: (err: Error) => {
          this.errorMessage.set(err.message || 'Error al registrarse');
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

  openTermsModal(event: Event): void {
    this.legalModals().openTermsModal(event);
  }

  openPrivacyModal(event: Event): void {
    this.legalModals().openPrivacyModal(event);
  }

  detectLocation(): void {
    if (!navigator.geolocation) {
      this.errorMessage.set('Tu navegador no soporta geolocalización.');
      return;
    }

    this.isDetectingLocation.set(true);

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
          this.errorMessage.set('No se pudo obtener la ubicación.');
        } finally {
          this.isDetectingLocation.set(false);
        }
      },
      () => {
        this.errorMessage.set('Permiso de ubicación denegado.');
        this.isDetectingLocation.set(false);
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
    this.isLoading.set(false);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.isDetectingLocation.set(false);
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
