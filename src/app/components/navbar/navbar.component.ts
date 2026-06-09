import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

  constructor(private router: Router) {}

  get homeLink(): string {
    return localStorage.getItem('user') ? '/home' : '/';
  }

  openLoginModal(): void {
    this.router.navigate(['/login']);
    // Si luego hacéis modal, aquí lo cambiáis
  }
}
