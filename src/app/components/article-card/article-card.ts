import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Article } from '../../interfaces/article';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-article-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './article-card.html',
  styleUrl: './article-card.css',
})
export class ArticleCardComponent {
  @Input({ required: true }) item!: Article;
  private auth = inject(Auth);

  get displayLocation(): string {
    if (this.item.location) return this.item.location;
    // Fallback: localización del usuario actual para sus propios artículos
    const user = this.auth.currentUser();
    if (user && this.item.user_id === user.id && user.location) {
      return user.location;
    }
    return '';
  }

  private readonly placeholderImage =
    'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=600&q=80';

  get imageUrl(): string {
    return this.item.main_photo || this.item.image || this.placeholderImage;
  }

  get formattedPrice(): string {
    const price = Number(this.item.price);
    return Number.isNaN(price) ? String(this.item.price) : price.toFixed(2);
  }

  get conditionClass(): string {
    const condition = (this.item.condition ?? '').toLowerCase().trim();

    if (condition === 'nuevo') return 'condition-nuevo';
    if (condition.includes('como nuevo')) return 'condition-como-nuevo';
    if (condition.includes('buen')) return 'condition-buen-estado';
    if (condition.includes('aceptable') || condition.includes('usado')) return 'condition-usado';

    return 'condition-default';
  }
}
