import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FilterBarComponent } from '../../components/filter-bar/filter-bar';
import { ArticleCardComponent } from '../../components/article-card/article-card';
import { LoginModalComponent } from '../../components/login-modal/login-modal.component';
import { ArticleService } from '../../services/article';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, FilterBarComponent, ArticleCardComponent, LoginModalComponent],
  templateUrl: './landing.html',
  styleUrl: './landing.css',
})
export class Landing implements OnInit {

  allItems: any[] = [];
  items: any[] = [];

  constructor(private articleService: ArticleService, private router: Router) {}

  ngOnInit() {
    this.allItems = this.articleService.getArticles();
    this.items = [...this.allItems];
  }

  onFilter(filters: any) {
    this.items = this.allItems.filter(item => {
      const matchSearch =
        !filters.search ||
        item.title.toLowerCase().includes(filters.search.toLowerCase());
      const matchCategory =
        !filters.category ||
        item.category === filters.category;
      const matchPrice =
        !filters.maxPrice ||
        item.price <= filters.maxPrice;
      return matchSearch && matchCategory && matchPrice;
    });
  }
}
