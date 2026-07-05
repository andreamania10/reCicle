import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';
import { ArticleService } from '../../services/article';
import { Article } from '../../interfaces/article';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('loadMoreSentinel') loadMoreSentinel?: ElementRef<HTMLDivElement>;

  private articleService = inject(ArticleService);
  private route = inject(ActivatedRoute);
  private loadMoreObserver?: IntersectionObserver;

  items = signal<Article[]>([]);
  selectedCategory = signal('');
  isLoading = signal(true);
  isLoadingMore = signal(false);
  hasMore = signal(false);
  loadError = signal(false);

  private currentPage = 1;
  private currentFilters: Record<string, string> = {};

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const category = ((params['category'] as string) ?? '').trim();
      this.selectedCategory.set(category);
      this.currentFilters = category ? { category_id: category } : {};
      this.fetchArticles(true);
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
    if (!this.hasMore() || this.isLoading() || this.isLoadingMore()) {
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

  loadMoreArticles(): void {
    if (this.isLoading() || this.isLoadingMore() || !this.hasMore()) {
      return;
    }

    this.isLoadingMore.set(true);
    this.fetchArticles(false);
  }

  private fetchArticles(reset: boolean): void {
    const page = reset ? 1 : this.currentPage + 1;

    if (reset) {
      this.currentPage = 1;
      this.isLoading.set(true);
      this.isLoadingMore.set(false);
      this.hasMore.set(false);
      this.items.set([]);
    }

    this.loadError.set(false);

    this.articleService
      .getArticlesPage(page, this.currentFilters)
      .pipe(
        finalize(() => {
          this.isLoading.set(false);
          this.isLoadingMore.set(false);
          setTimeout(() => this.observeLoadMoreSentinel());
        }),
      )
      .subscribe({
        next: (response) => {
          const articles = response.results ?? [];

          if (reset) {
            this.items.set(articles);
            this.currentPage = 1;
          } else {
            this.items.update((current) => [...current, ...articles]);
            this.currentPage = page;
          }

          this.hasMore.set(this.articleService.hasMorePages(articles.length));
        },
        error: () => {
          this.loadError.set(true);
        },
      });
  }

  private observeLoadMoreSentinel(): void {
    this.loadMoreObserver?.disconnect();

    const sentinel = this.loadMoreSentinel?.nativeElement;
    if (sentinel && this.hasMore()) {
      this.loadMoreObserver?.observe(sentinel);
    }
  }
}
