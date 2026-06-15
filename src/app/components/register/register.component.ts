import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
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
    acceptTerms: false
  };

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(private router: Router) {}

  get passwordMismatch(): boolean {
    return (
      this.registerData.password !== '' &&
      this.registerData.confirmPassword !== '' &&
      this.registerData.password !== this.registerData.confirmPassword
    );
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || this.passwordMismatch) return;

    this.isLoading = true;
    this.errorMessage = '';

    // TODO: conectar con AuthService cuando esté disponible
    setTimeout(() => {
      this.isLoading = false;
      this.successMessage = '¡Cuenta creada correctamente! Redirigiendo...';
      setTimeout(() => this.router.navigate(['/']), 1500);
    }, 900);
  }

  goToLogin(): void {
    this.router.navigate(['/']);
  }

  // Localizacion 

  isDetectingLocation = false;

  detectLocation(): void {
    if (!navigator.geolocation) {
      this.errorMessage = 'Tu navegador no soporta geolocalización.';
      return;
    }

    this.isDetectingLocation = true;

    navigator.geolocation.getCurrentPosition( async (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await response.json();

        // Coge ciudad o provincia de la respuesta
        const city = data.address.city || data.address.town || data.address.village || data.address.county || '';
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
    }
  );
}







}

