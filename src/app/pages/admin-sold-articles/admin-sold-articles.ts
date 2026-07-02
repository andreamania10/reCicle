import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ArticleService } from '../../services/article';
import { Article } from '../../interfaces/article';

@Component({
  selector: 'app-admin-sold-articles',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-sold-articles.html',
  styleUrl: './admin-sold-articles.css',
})
export class AdminSoldArticles implements OnInit {
  private articleService = inject(ArticleService);

  soldArticles = signal<Article[]>([]);
  loading = signal(false);
  error = signal(false);
  search = '';

  filteredArticles = computed(() => {
    const term = this.search.trim().toLowerCase();
    if (!term) return this.soldArticles();
    return this.soldArticles().filter((a) => a.title?.toLowerCase().includes(term));
  });

  ngOnInit(): void {
    this.loadSoldArticles();
  }

  loadSoldArticles(): void {
    this.loading.set(true);
    this.error.set(false);
    this.articleService.getByStatus('Vendido').subscribe({
      next: (articles) => {
        this.soldArticles.set(articles);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
