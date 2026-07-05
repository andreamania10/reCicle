import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
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
  styleUrls: ['./home.css'],
})
export class Home implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('loadMoreSentinel') loadMoreSentinel?: ElementRef<HTMLDivElement>;

  private articleService = inject(ArticleService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);

  constructor(private router: Router, public auth: Auth, private cdr: ChangeDetectorRef) {}

  private currentPage = 1;
  private currentFilters: Record<string, string> = {};
  private loadMoreObserver?: IntersectionObserver;

  isFiltersOpen = false;

  allArticles = signal<Article[]>([]);
  minPrice: number = 0;
  maxPrice: number = 1000;
  searchTitle: string = '';
  selectedCondition: string = '';
  location: string = '';

  slides = [
    { image: 'assets/imagenes/banner-home.jpg' },
    { image: 'assets/imagenes/banner-buy.jpg' },
    { image: 'assets/imagenes/banner-tablet.jpg' },
  ];

  currentIndex = 0;

  categories = signal<Category[]>([]);
  items = signal<Article[]>([]);
  selectedCategoryId = signal<number | null>(null);
  selectedCategoryName = signal('');
  isLoadingCategories = signal(true);
  isLoadingArticles = signal(true);
  isLoadingMore = signal(false);
  hasMore = signal(false);
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
        this.currentFilters = { search };
        this.fetchArticles(true);
        return;
      }

      if (this.selectedCategoryId() === null) {
        this.currentFilters = {};
        this.fetchArticles(true);
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

  ngAfterViewInit(): void {
    this.loadMoreObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.loadMoreArticles();
        }
      },
      { root: null, rootMargin: '300px', threshold: 0 },
    );

    setTimeout(() => this.observeLoadMoreSentinel());
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (!this.hasMore() || this.isLoadingArticles() || this.isLoadingMore()) {
      return;
    }

    const scrollBottom = window.scrollY + window.innerHeight;
    const documentBottom = document.documentElement.scrollHeight - 300;

    if (scrollBottom >= documentBottom) {
      this.loadMoreArticles();
    }
  }

  ngOnDestroy(): void {
    this.loadMoreObserver?.disconnect();
  }

  applyFilters(): void {
    const hasBackendFilters = !!this.selectedCondition;

    if (hasBackendFilters) {
      this.currentFilters = {};
      if (this.selectedCondition) this.currentFilters['condition'] = this.selectedCondition;
      if (this.searchTitle) this.currentFilters['search'] = this.searchTitle;
      if (this.selectedCategoryId()) {
        this.currentFilters['category_id'] = String(this.selectedCategoryId());
      }
      if (this.maxPrice < 1000) this.currentFilters['max_price'] = String(this.maxPrice);

      this.fetchArticles(true, { applyLocalFilters: true });
      return;
    }

    this.updateVisibleItems();
  }

  toggleFilters() {
    this.isFiltersOpen = !this.isFiltersOpen;
  }

  selectCategory(categoryId: number | null): void {
    if (categoryId === null) {
      this.selectedCategoryId.set(null);
      this.selectedCategoryName.set('');
      this.currentFilters = {};
      this.router.navigate(['/'], { queryParams: { search: null } });
      this.fetchArticles(true);
      return;
    }

    const id = Number(categoryId);

    if (!Number.isInteger(id) || id <= 0) {
      return;
    }

    this.selectedCategoryId.set(id);
    this.selectedCategoryName.set(
      this.categories().find((category) => category.id === id)?.name ?? '',
    );

    this.currentFilters = { category_id: String(id) };
    this.router.navigate(['/'], { queryParams: { search: null } });
    this.fetchArticles(true);
  }

  loadMoreArticles(): void {
    if (this.isLoadingArticles() || this.isLoadingMore() || !this.hasMore()) {
      return;
    }

    this.isLoadingMore.set(true);
    this.fetchArticles(false);
  }

  private fetchArticles(reset: boolean, options?: { applyLocalFilters?: boolean }): void {
    const page = reset ? 1 : this.currentPage + 1;

    if (reset) {
      this.currentPage = 1;
      this.isLoadingArticles.set(true);
      this.isLoadingMore.set(false);
      this.hasMore.set(false);
      this.allArticles.set([]);
      this.items.set([]);
    }

    this.articlesError.set(false);
    this.cdr.detectChanges();

    this.articleService
      .getArticlesPage(page, this.currentFilters)
      .pipe(
        finalize(() => {
          this.isLoadingArticles.set(false);
          this.isLoadingMore.set(false);
          setTimeout(() => this.observeLoadMoreSentinel());
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (response) => {
          const articles = response.results ?? [];

          if (reset) {
            this.allArticles.set(articles);
            this.currentPage = 1;
          } else {
            this.allArticles.update((current) => [...current, ...articles]);
            this.currentPage = page;
          }

          this.hasMore.set(
            this.articleService.hasMorePages(articles.length),
          );

          if (options?.applyLocalFilters || this.hasLocalFilters()) {
            this.updateVisibleItems();
          } else {
            this.items.set(this.allArticles());
          }
        },
        error: () => {
          this.articlesError.set(true);
        },
      });
  }

  private hasLocalFilters(): boolean {
    return (
      this.minPrice > 0 ||
      this.maxPrice < 1000 ||
      (!this.activeSearch() && !!this.searchTitle) ||
      !!this.location
    );
  }

  private updateVisibleItems(): void {
    const filtered = this.allArticles().filter((article) => this.matchesLocalFilters(article));
    this.items.set(filtered);
  }

  private matchesLocalFilters(article: Article): boolean {
    const price = Number(article.price);

    if (this.selectedCategoryId() !== null && article.category_id !== this.selectedCategoryId()) {
      return false;
    }

    if (price < this.minPrice || price > this.maxPrice) {
      return false;
    }

    if (
      !this.activeSearch() &&
      this.searchTitle &&
      !article.title.toLowerCase().includes(this.searchTitle.toLowerCase())
    ) {
      return false;
    }

    if (this.location && !article.location?.toLowerCase().includes(this.location.toLowerCase())) {
      return false;
    }

    return true;
  }

  private observeLoadMoreSentinel(): void {
    this.loadMoreObserver?.disconnect();

    const sentinel = this.loadMoreSentinel?.nativeElement;
    if (sentinel && this.hasMore()) {
      this.loadMoreObserver?.observe(sentinel);
    }
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

    this.updateVisibleItems();
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

  onSlideImageError(index: number): void {
    const fallback = 'assets/imagenes/banner-home.jpg';
    const slide = this.slides[index];

    if (slide && slide.image !== fallback) {
      slide.image = fallback;
      this.cdr.detectChanges();
    }
  }
}
