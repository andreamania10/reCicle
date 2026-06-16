import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, combineLatest, map, Observable, of } from 'rxjs';
import { FilterBarComponent } from '../../components/filter-bar/filter-bar';
import { ArticleCardComponent } from '../../components/article-card/article-card';
import { ArticleService } from '../../services/article';
import { CategoryService } from '../../services/category';
import { Category } from '../../interfaces/category';
import { Article } from '../../interfaces/article';

interface CategoriesState {
  loading: boolean;
  error: boolean;
  categories: Category[];
}

interface ArticlesState {
  loading: boolean;
  error: boolean;
}

interface ArticleFilters {
  search: string;
  category: string;
  maxPrice: number | null;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ArticleCardComponent],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing implements OnInit {
  categoriesState$!: Observable<CategoriesState>;
  articlesState$!: Observable<ArticlesState>;
  filteredArticles$!: Observable<Article[]>;

  private readonly filters$ = new BehaviorSubject<ArticleFilters>({
    search: '',
    category: '',
    maxPrice: null,
  });

  constructor(
    private articleService: ArticleService,
    private categoryService: CategoryService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.categoriesState$ = this.categoryService.getCategories().pipe(
      map((categories) => ({ loading: false, error: false, categories })),
      catchError(() =>
        of({ loading: false, error: true, categories: [] as Category[] }),
      ),
    );

    const articlesResult$ = this.articleService.getArticles().pipe(
      map((articles) => ({ error: false, articles })),
      catchError(() => of({ error: true, articles: [] as Article[] })),
    );

    this.articlesState$ = articlesResult$.pipe(
      map(({ error }) => ({ loading: false, error })),
    );

    this.filteredArticles$ = combineLatest([
      articlesResult$.pipe(map(({ articles }) => articles)),
      this.filters$,
    ]).pipe(map(([articles, filters]) => this.applyFilter(articles, filters)));
  }

  goToCategory(slug: string): void {
    this.router.navigate(['/categories'], {
      queryParams: { category: slug },
    });
  }

  onFilter(filters: ArticleFilters): void {
    this.filters$.next(filters);
  }

  private applyFilter(articles: Article[], filters: ArticleFilters): Article[] {
    return articles.filter((item) => {
      const matchSearch =
        !filters.search ||
        item.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        (item.description ?? '').toLowerCase().includes(filters.search.toLowerCase());

      const matchCategory =
        !filters.category || String(item.category_id) === filters.category;

      const matchPrice =
        !filters.maxPrice || Number(item.price) <= filters.maxPrice;

      return matchSearch && matchCategory && matchPrice;
    });
  }
}
