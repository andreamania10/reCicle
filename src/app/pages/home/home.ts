import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ArticleCardComponent } from '../../components/article-card/article-card';
import { Article } from '../../interfaces/article';
import { Category } from '../../interfaces/category';
import { ArticleService } from '../../services/article';
import { CategoryService } from '../../services/category';
import { Router } from '@angular/router';
import { Auth } from '../../services/auth';
import { FormsModule } from '@angular/forms';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ArticleCardComponent, FormsModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  private articleService = inject(ArticleService);
  private categoryService = inject(CategoryService);

  constructor(private router: Router, public auth: Auth, private cdr: ChangeDetectorRef) {}

  isFiltersOpen = false;

  allArticles = signal<Article[]>([]);
  minPrice: number = 0;
  maxPrice: number = 1000;
  searchTitle: string = '';
  selectedCondition: string = '';
  location: string = '';

  slides = [
    {
      image: '/assets/imagenes/tablet.jpg',
      action: 'sell'
    },
    {
      image: '/assets/imagenes/hogar.jpg',
      action: 'home'
    },
    {
      image: '/assets/imagenes/buy.jpg',
      action: 'search'
    }
  ];

  currentIndex = 0;

  categories = signal<Category[]>([]);
  items = signal<Article[]>([]);
  selectedCategoryId = signal<number | null>(null);
  selectedCategoryName = signal('');
  isLoadingCategories = signal(true);
  isLoadingArticles = signal(true);
  categoriesError = signal(false);
  articlesError = signal(false);

  ngOnInit(): void {
    this.loadRecentArticles();

    
    setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.slides.length;
      this.cdr.detectChanges();
    }, 3500);


    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.isLoadingCategories.set(false);
      },
      error: () => {
        this.categoriesError.set(true);
        this.isLoadingCategories.set(false);
      },
    });
  }

  applyFilters(): void {
    const filtered = this.allArticles().filter((a) => {
      const price = Number(a.price);
  
      if (this.selectedCategoryId() !== null && a.category_id !== this.selectedCategoryId()) {
        return false;
      }
  
      if (price < this.minPrice || price > this.maxPrice) {
        return false;
      }
  
      if (
        this.searchTitle &&
        !a.title.toLowerCase().includes(this.searchTitle.toLowerCase())
      ) {
        return false;
      }
  
      if (
        this.selectedCondition &&
        a.condition?.toLowerCase() !== this.selectedCondition.toLowerCase()
      ) {
        return false;
      }
  
      if (
        this.location &&
        !a.location?.toLowerCase()?.includes(this.location.toLowerCase())
      ) {
        return false;
      }
  
      return true;
    });
  
    this.items.set(filtered);
  }

  toggleFilters() {
    this.isFiltersOpen = !this.isFiltersOpen;
  }

  onSlideClick(slide: any) {
    if (slide.action === 'sell') {
      this.router.navigate(['/sellProduct']);
    }
  }

  selectCategory(categoryId: number | null): void {
    if (categoryId === null) {
      this.selectedCategoryId.set(null);
      this.selectedCategoryName.set('');
      this.loadRecentArticles(); // reset a tots els articles
      return;
    }

    const id = Number(categoryId);
    
    if (!Number.isInteger(id) || id <= 0) {
      return;
    }

    this.selectedCategoryId.set(id);
    this.selectedCategoryName.set(
      this.categories().find((category) => category.id === id)?.name ?? ''
    );

    this.loadArticlesByCategory(id);
  }

  private loadRecentArticles(): void {
    this.isLoadingArticles.set(true);
    this.articlesError.set(false);

    this.articleService
      .getArticles()
      .pipe(finalize(() => this.isLoadingArticles.set(false)))
      .subscribe({
        next: (articles) => {
          this.allArticles.set(articles);
          this.applyFilters();
        },
        error: () => {
          this.articlesError.set(true);
        },
      });
  }

  private loadArticlesByCategory(categoryId: number): void {
    const id = Number(categoryId);

    if (!Number.isInteger(id) || id <= 0) {
      this.articlesError.set(true);
      return;
    }

    this.isLoadingArticles.set(true);
    this.articlesError.set(false);
    this.items.set([]);

    this.articleService
      .getByCategoryId(id)
      .pipe(finalize(() => this.isLoadingArticles.set(false)))
      .subscribe({
        next: (articles) => {
          this.allArticles.set(articles);
          this.applyFilters();
        },
        error: () => {
          this.articlesError.set(true);
        },
      });
  }
  
  resetFilters() {
    this.searchTitle = '';
    this.maxPrice = 1000;
    this.selectedCondition = '';
    this.location = '';
  
    this.applyFilters();
  }

  getCategoryIcon(category: Category): string {
    const icons: Record<number, string> = {
      1: 'bi-phone',
      2: 'bi-bag-heart',
      3: 'bi-house-door',
      4: 'bi-bicycle',
      5: 'bi-book',
    };

    return icons[category.id] ?? 'bi-tag';
  }
}