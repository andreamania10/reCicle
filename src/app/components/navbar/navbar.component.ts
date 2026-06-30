import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { User } from '../../interfaces/user';
// import { UserService } from '../../services/user';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { Auth } from '../../services/auth';
import { RegisterComponent } from '../register/register.component';
import { NotificationBellComponent } from '../notification-bell/notification-bell';

declare var bootstrap: any;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RegisterComponent, FormsModule, NotificationBellComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})

export class NavbarComponent implements OnInit{
  @Input() showLoginButton = false;
  isMenuOpen = false;
  profile: User | null = null;
  searchTerm = '';

  constructor(
    // private userService: UserService,
    readonly auth: Auth,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.auth.isLoggedIn();

    this.route.queryParams.subscribe((params) => {
      this.searchTerm = (params['search'] as string) ?? '';
    });
  
    const userId = this.auth.currentUser()?.id;
    if (!userId) return;
  
    // this.userService.getById(userId).subscribe({
    //   next: (user: User) => {
    //     this.profile = user;
    //   },
    //   error: (err: unknown) => {
    //     console.error('Error carregant perfil al navbar', err);
    //   }
    // });
  }

  
goHome() {
  const link = this.auth.currentUser() ? '/home' : '/';
  window.location.href = link;
}

  

  // get userInitial(): string {
  //   return this.profile?.username?.charAt(0).toUpperCase() ?? '?';
  // }

  openLoginModal(): void {
    const modalEl = document.getElementById('loginModal');
    if (modalEl) {
      new bootstrap.Modal(modalEl).show();
    }
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  sellProducts(){
    this.router.navigate(['/sellProduct'])
  }
  
goToFavorites() {
  this.router.navigate(['/favorites']);
}

goToMessages() {
  this.router.navigate(['/messages']);
}

onSearch(event: Event): void {
  event.preventDefault();
  const term = this.searchTerm.trim();

  this.router.navigate(['/'], {
    queryParams: { search: term || null },
  });
}

}