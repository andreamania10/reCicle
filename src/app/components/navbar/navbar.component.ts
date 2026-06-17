import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RegisterComponent } from '../register/register.component';
import { Auth } from '../../services/auth';

declare var bootstrap: any;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RegisterComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  @Input() showLoginButton = false;
  isMenuOpen = false;

  constructor(
    readonly auth: Auth,
    private router: Router,
  ) {}

  get homeLink(): string {
    return this.auth.currentUser() ? '/home' : '/';
  }

  openLoginModal(): void {
    const modalEl = document.getElementById('loginModal');
    if (modalEl) {
      new bootstrap.Modal(modalEl).show();
    }
  }

  goToProfile(userId: number): void {
    this.router.navigate(['/profile', userId]);
  }
}
