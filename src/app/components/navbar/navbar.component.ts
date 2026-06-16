import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { RegisterComponent } from '../register/register.component';

declare var bootstrap: any;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RegisterComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent {
  @Input() showLoginButton = false;
  isMenuOpen = false;

  get homeLink(): string {
    return localStorage.getItem('user') ? '/home' : '/';
  }

  openLoginModal(): void {
    const modalEl = document.getElementById('loginModal');
    if (modalEl) {
      new bootstrap.Modal(modalEl).show();
    }
  }
}
