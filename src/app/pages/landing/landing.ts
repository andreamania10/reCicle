import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ArticleCardComponent } from '../../components/article-card/article-card';
import { Article } from '../../interfaces/article';
import { Category } from '../../interfaces/category';
import { ArticleService } from '../../services/article';
import { CategoryService } from '../../services/category';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, ArticleCardComponent],
  templateUrl: './landing.html',
  styleUrls: ['./landing.css']
})
export class Landing implements OnInit {
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