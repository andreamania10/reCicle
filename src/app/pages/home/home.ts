import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ArticleCardComponent } from '../../components/article-card/article-card';
import { Article } from '../../interfaces/article';
import { Category } from '../../interfaces/category';
import { ArticleService } from '../../services/article';
import { CategoryService } from '../../services/category';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ArticleCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private articleService = inject(ArticleService);
  private categoryService = inject(CategoryService);

  categories = signal<Category[]>([]);
  items = signal<Article[]>([]);
  selectedCategoryId = signal<number | null>(null);
  selectedCategoryName = signal('');
  isLoadingCategories = signal(true);
  isLoadingArticles = signal(true);
  categoriesError = signal(false);
  articlesError = signal(false);

  private readonly categoryImages: Record<number, string> = {
    1: 'https://st2.depositphotos.com/1000128/5573/i/450/depositphotos_55735071-stock-photo-modern-touchscreen-smartphones.jpg',
    2: 'https://i.pinimg.com/736x/c1/c9/4e/c1c94e5cd15cd32a15e11044de898ca8.jpg',
    3: 'https://queondagye.com/wp-content/uploads/2023/01/De-Prati-Tendencias.jpg',
    4: 'https://images.ctfassets.net/ipjoepkmtnha/3QqEt0VPI4hAAVo6lhxriy/31aaee8b9dc392e2a9ef9fe8891efefa/technogym-elliptical-home-img.jpg',
    5: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=600&q=80',
  };

  ngOnInit(): void {
    this.loadRecentArticles();

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

  selectCategory(categoryId: number): void {
    const id = Number(categoryId);

    if (!Number.isInteger(id) || id <= 0) {
      return;
    }

    this.selectedCategoryId.set(id);
    this.selectedCategoryName.set(
      this.categories().find((category) => category.id === id)?.name ?? '',
    );
    this.loadArticlesByCategory(id);
  }

  getCategoryImage(categoryId: number): string {
    const id = Number(categoryId);

    return (
      this.categoryImages[id] ??
      'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=600&q=80'
    );
  }

  private loadRecentArticles(): void {
    this.isLoadingArticles.set(true);
    this.articlesError.set(false);

    this.articleService
      .getArticles()
      .pipe(finalize(() => this.isLoadingArticles.set(false)))
      .subscribe({
        next: (articles) => {
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
          this.items.set(articles);
        },
        error: () => {
          this.articlesError.set(true);
        },
      });
  }
}
