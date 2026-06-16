import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArticleService } from '../../services/article';
import { CommonModule } from '@angular/common';
import { ArticleCardComponent } from '../../components/article-card/article-card';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, ArticleCardComponent],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {

  allItems: any[] = [];
  items: any[] = [];
  selectedCategory: string = '';

  constructor(
    private articleService: ArticleService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.articleService.getArticles().then(data => {
      this.allItems = data;
  
      this.route.queryParams.subscribe(params => {
        this.selectedCategory = params['category'];
  
        if (this.selectedCategory) {
          this.items = this.allItems.filter(item =>
            item.category === this.selectedCategory
          );
        } else {
          this.items = [...this.allItems];
        }
      });
    });
  }
  
}