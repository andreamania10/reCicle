import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

declare var bootstrap: any;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})

export class NavbarComponent {

  @Input() showLoginButton = false;
  isMenuOpen = false;

  
  constructor(private router: Router) {}

  get homeLink(): string {
    return localStorage.getItem('user') ? '/home' : '/';
  }

  openLoginModal(): void {
    this.router.navigate(['/login']);
    // Si luego hacéis modal, aquí lo cambiáis
  }
}
