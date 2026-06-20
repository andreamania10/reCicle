import { Component } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { LoginModalComponent } from './components/login-modal/login-modal.component';



@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, NavbarComponent, FooterComponent, LoginModalComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  isPublicPage = true;

  constructor(private router: Router) {
    this.checkRoute(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(event => {
        if (event instanceof NavigationEnd) {
          this.checkRoute(event.urlAfterRedirects);
        }
      });
  }

  private checkRoute(url: string) {
    // Landing (/) y register son páginas públicas — muestran el botón Login
    const publicRoutes = ['/', '/register'];
    this.isPublicPage = publicRoutes.some(r => url === r || url.startsWith(r + '?'));
  }
}
