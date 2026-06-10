import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ArticleService } from '../../services/article';
import { Category as CategoryService } from '../../services/category';
import { ApiArticle } from '../../interfaces/article';
import { Category } from '../../interfaces/category';

interface MenuItem {
  label: string;
  icon: string;
  link: string;
  badge?: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  private articleService = inject(ArticleService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  articles = signal<ApiArticle[]>([]);
  categories = signal<Category[]>([]);
  loadingArticles = signal(true);
  loadingCategories = signal(true);
  errorArticles = signal(false);

  menuItems: MenuItem[] = [
    { label: 'Inicio', icon: 'bi-house', link: '/home' },
    { label: 'Explorar', icon: 'bi-compass', link: '/articles' },
    { label: 'Favoritos', icon: 'bi-heart', link: '/favorites' },
    { label: 'Mi perfil', icon: 'bi-person', link: '/login' }
  ];

  /** Iconos de Bootstrap Icons por slug de categoría del backend */
  private categoryIcons: Record<string, string> = {
    'electronica': 'bi-phone',
    'ropa-moda': 'bi-handbag',
    'hogar': 'bi-house-heart',
    'deportes': 'bi-trophy',
    'libros': 'bi-book'
  };

  ngOnInit() {
    this.categoryService.getCategories().subscribe({
      next: cats => {
        this.categories.set(cats);
        this.loadingCategories.set(false);
      },
      error: () => this.loadingCategories.set(false)
    });

    this.articleService.getPublishedArticles({ page: 1, pageSize: 8 }).subscribe({
      next: res => {
        this.articles.set(res.results);
        this.loadingArticles.set(false);
      },
      error: () => {
        this.errorArticles.set(true);
        this.loadingArticles.set(false);
      }
    });
  }

  iconFor(category: Category): string {
    return this.categoryIcons[category.slug] ?? 'bi-tag';
  }

  goToCategory(categoryId: number) {
    this.router.navigate(['/categories'], { queryParams: { category: categoryId } });
  }

  badgeClass(condition: string): string {
    switch ((condition || '').toLowerCase()) {
      case 'nuevo': return 'text-bg-success';
      case 'como nuevo': return 'text-bg-info';
      case 'buen estado': return 'text-bg-secondary';
      default: return 'text-bg-light border';
    }
  }

  timeAgo(dateIso: string): string {
    const diffMs = Date.now() - new Date(dateIso).getTime();
    const minutes = Math.floor(diffMs / 60000);
    if (minutes < 1) return 'Hace un momento';
    if (minutes < 60) return `Hace ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
    const months = Math.floor(days / 30);
    return `Hace ${months} ${months === 1 ? 'mes' : 'meses'}`;
  }
}
