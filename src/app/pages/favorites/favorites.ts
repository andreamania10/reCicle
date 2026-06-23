import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';
import { FavoriteService, Favorite } from '../../services/favorite';

@Component({
  selector: 'app-favorites',
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class Favorites implements OnInit {

  private cdr = inject(ChangeDetectorRef);
  private auth = inject(Auth);
  private favoriteService = inject(FavoriteService);

  favorites: Favorite[] = [];
  loading = true;
  errorMessage = '';

  ngOnInit() {
    const currentUser = this.auth.currentUser();

    if (!currentUser?.token) {
      this.errorMessage = 'Debes iniciar sesión para ver tus favoritos.';
      this.loading = false;
      return;
    }

    this.favoriteService.getUserFavorites(currentUser.token).subscribe({
      next: (response) => {
        this.favorites = response.results;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los favoritos.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  removeFavorite(favoriteId: number) {
    const currentUser = this.auth.currentUser();
    if (!currentUser?.token) return;

    this.favoriteService.remove(favoriteId, currentUser.token).subscribe({
      next: () => {
        this.favorites = this.favorites.filter(f => f.favoriteId !== favoriteId);
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMessage = 'No se pudo quitar de favoritos.';
        this.cdr.detectChanges();
      }
    });
  }
}