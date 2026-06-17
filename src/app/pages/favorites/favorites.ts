import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Article } from '../../interfaces/article';

@Component({
  selector: 'app-favorites',
  imports: [CommonModule, RouterLink],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class Favorites implements OnInit {

  private cdr = inject(ChangeDetectorRef);

  favoriteArticles: Article[] = [];
  loading = true;

  mockFavorites: Article[] = [
    { id: 14, user_id: 2, category_id: 1, title: 'AirPods Pro 2', description: 'Estuche de carga USB-C', price: 150, condition: 'Buen estado', status: 'Publicado', location: 'Madrid', main_photo: 'https://images.unsplash.com/photo-1588449668338-d13417f16af1?auto=format&fit=crop&w=600&q=80' },
    { id: 16, user_id: 2, category_id: 2, title: "Vaqueros Levi's 501", description: 'Talla 32, corte clásico', price: 50, condition: 'Buen estado', status: 'Publicado', location: 'Barcelona', main_photo: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80' },
  ];

  ngOnInit() {
    setTimeout(() => {
      this.favoriteArticles = this.mockFavorites;
      this.loading = false;
      this.cdr.detectChanges();
    }, 300);
  }

  removeFavorite(id: number) {
    this.favoriteArticles = this.favoriteArticles.filter(a => a.id !== id);
    this.cdr.detectChanges();
  }
}