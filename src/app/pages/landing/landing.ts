import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { ArticleCardComponent } from '../../components/article-card/article-card';
import { Article } from '../../interfaces/article';
import { Category } from '../../interfaces/category';
import { ArticleService } from '../../services/article';
import { CategoryService } from '../../services/category';
import { Router } from '@angular/router';

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
  constructor(private router: Router) {}
  
  slides = [
    {
      image: 'assets/img1.jpg',
      title: 'Compra y vende',
      subtitle: 'de la forma más fácil',
      action: 'sell'
    },
    {
      image: 'assets/img2.jpg',
      title: 'Dale un toque de elegancia',
      subtitle: 'a tu hogar',
      action: 'home'
    },
    {
      image: 'assets/img3.jpg',
      title: 'Encuentra lo que buscas',
      subtitle: 'a un clic',
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
  this.currentIndex =
    (this.currentIndex + 1) % this.slides.length;
}, 10000);

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

  onSlideClick(slide: any) {
    if (slide.action === 'sell') {
      this.router.navigate(['/sellProduct']); 
    }
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