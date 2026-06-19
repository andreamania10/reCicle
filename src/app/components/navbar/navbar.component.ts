import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { User } from '../../interfaces/user';
// import { UserService } from '../../services/user';
import { Router, RouterModule } from '@angular/router';

import { Auth } from '../../services/auth';
import { RegisterComponent } from '../register/register.component';

declare var bootstrap: any;

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RegisterComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class NavbarComponent implements OnInit{
  @Input() showLoginButton = false;
  isMenuOpen = false;
  profile: User | null = null;

  constructor(
    // private userService: UserService,
    readonly auth: Auth,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.auth.isLoggedIn();
  
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

  get homeLink(): string {
    return this.auth.currentUser() ? '/home' : '/';
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

  goToProfile(userId: number): void {
    this.router.navigate(['/profile', userId]);
  }

  sellProducts(){
    this.router.navigate(['/sellProduct'])
  }
}