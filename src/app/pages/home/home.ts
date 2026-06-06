import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FilterBarComponent } from '../../components/filter-bar/filter-bar';
import { ArticleCardComponent } from '../../components/article-card/article-card';
import { ArticleService } from '../../services/article';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FilterBarComponent, ArticleCardComponent],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  allItems: any[] = [];
  items: any[] = [];

  constructor(private articleService: ArticleService) {}

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