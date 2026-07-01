import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { ArticleCardComponent } from '../../components/article-card/article-card';
import { Article } from '../../interfaces/article';
import { Category } from '../../interfaces/category';
import { ArticleService } from '../../services/article';
import { Auth } from '../../services/auth';
import { CategoryService } from '../../services/category';

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
  private route = inject(ActivatedRoute);

  constructor(private router: Router, public auth: Auth, private cdr: ChangeDetectorRef) {}

  isFiltersOpen = false;

  allArticles = signal<Article[]>([]);
  minPrice: number = 0;
  maxPrice: number = 1000;
  searchTitle: string = '';
  selectedCondition: string = '';
  location: string = '';

  slides = [
    { image: '/assets/imagenes/banner-tablet.jpg' },
    { image: '/assets/imagenes/banner-home.jpg' },
    { image: '/assets/imagenes/banner-buy.jpg' },
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
  activeSearch = signal('');

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const search = ((params['search'] as string) ?? '').trim();
      this.activeSearch.set(search);
      this.searchTitle = search;

      if (search) {
        this.selectedCategoryId.set(null);
        this.selectedCategoryName.set('');
        this.loadSearchResults(search);
        return;
      }

      if (this.selectedCategoryId() === null) {
        this.loadRecentArticles();
      }
    });

    setInterval(() => {
      this.currentIndex = (this.currentIndex + 1) % this.slides.length;
      this.cdr.detectChanges();
    }, 3500);

    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories.set(categories);
        this.isLoadingCategories.set(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.categoriesError.set(true);
        this.isLoadingCategories.set(false);
      },
    });
  }

  applyFilters(): void {
    const hasBackendFilters = this.selectedCondition;

    if (hasBackendFilters) {
      this.isLoadingArticles.set(true);
      this.articlesError.set(false);

      const filters: any = {};
      if (this.selectedCondition) filters.condition = this.selectedCondition;
      if (this.searchTitle) filters.search = this.searchTitle;
      if (this.selectedCategoryId()) filters.category_id = String(this.selectedCategoryId());
      if (this.maxPrice < 1000) filters.max_price = String(this.maxPrice);

      this.articleService.getFiltered(filters)
        .pipe(finalize(() => this.isLoadingArticles.set(false)))
        .subscribe({
          next: (articles) => {
            // Filtro local por localización y precio
            const filtered = articles.filter((a) => {
              if (this.location && !a.location?.toLowerCase().includes(this.location.toLowerCase())) {
                return false;
              }
              if (Number(a.price) > this.maxPrice) {
                return false;
              }
              return true;
            });
            this.items.set(filtered);
            this.cdr.detectChanges();
          },
          error: () => {
            this.articlesError.set(true);
          }
        });
      return;
    }

    // Sin filtros de backend, filtrar localmente
    const filtered = this.allArticles().filter((a) => {
      const price = Number(a.price);

      if (this.selectedCategoryId() !== null && a.category_id !== this.selectedCategoryId()) {
        return false;
      }

      if (price < this.minPrice || price > this.maxPrice) {
        return false;
      }

      if (
        !this.activeSearch() &&
        this.searchTitle &&
        !a.title.toLowerCase().includes(this.searchTitle.toLowerCase())
      ) {
        return false;
      }

      if (
        this.location &&
        !a.location?.toLowerCase().includes(this.location.toLowerCase())
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

  selectCategory(categoryId: number | null): void {
    if (categoryId === null) {
      this.selectedCategoryId.set(null);
      this.selectedCategoryName.set('');
      this.router.navigate(['/'], { queryParams: { search: null } });
      this.loadRecentArticles();
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

    this.router.navigate(['/'], { queryParams: { search: null } });
    this.loadArticlesByCategory(id);
  }

  private loadRecentArticles(): void {
    this.isLoadingArticles.set(true);
    this.articlesError.set(false);
    this.cdr.detectChanges();

    this.articleService
      .getArticles()
      .pipe(finalize(() => this.isLoadingArticles.set(false)))
      .subscribe({
        next: (articles) => {
          this.allArticles.set(articles);
          this.items.set(articles);
        },
        error: () => {
          this.articlesError.set(true);
        },
      });
  }

  private loadSearchResults(term: string): void {
    this.isLoadingArticles.set(true);
    this.articlesError.set(false);
    this.items.set([]);
    this.cdr.detectChanges();

    this.articleService
      .searchArticles(term)
      .pipe(finalize(() => this.isLoadingArticles.set(false)))
      .subscribe({
        next: (articles) => {
          this.allArticles.set(articles);
          this.items.set(articles);
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
          this.items.set(articles);
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

    if (this.activeSearch()) {
      this.router.navigate(['/'], { queryParams: { search: null } });
      return;
    }

    this.items.set(this.allArticles());
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