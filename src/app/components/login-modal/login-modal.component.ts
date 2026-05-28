import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

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
  errorMessage = '';
  isLoading = false;

  constructor(private router: Router) {}

  onSubmit(form: NgForm): void {
    if (form.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    // TODO: conectar con AuthService cuando esté disponible
    setTimeout(() => {
      this.isLoading = false;
      // Simulación: aquí iría la llamada al backend
      console.log('Login con:', this.loginData);
    }, 800);
  }

  goToRegister(): void {
    const modalEl = document.getElementById('loginModal');
    if (modalEl) {
      const modal = bootstrap.Modal.getInstance(modalEl);
      modal?.hide();
    }
    this.router.navigate(['/registro']);
  }

  resetForm(): void {
    this.loginData = { email: '', password: '' };
    this.errorMessage = '';
    this.isLoading = false;
  }
}

