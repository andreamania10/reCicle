import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArticleService } from '../../services/article';
import { CommonModule } from '@angular/common';
import { Article } from '../../interfaces/article';
 
@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {
 
  private articleService = inject(ArticleService);
  private route = inject(ActivatedRoute);
 
  allItems: Article[] = [];
  items: Article[] = [];
  selectedCategory: string = '';
 
  ngOnInit(): void {
  this.articleService.getAll().subscribe(data => {
    this.allItems = data.results;
 
    this.route.queryParams.subscribe(params => {
      this.selectedCategory = params['category'];
 
      if (this.selectedCategory) {
        this.items = this.allItems.filter(item =>
          item.category_id === Number(this.selectedCategory)
        );
      } else {
        this.items = [...this.allItems];
      }
    });
  });
}
}