import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css']
})
export class Landing {
  constructor(private router: Router) {}

  goToHome() {
    this.router.navigate(['/home']);
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}