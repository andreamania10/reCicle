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
}

