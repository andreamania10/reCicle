import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ArticleService } from '../../services/article';
import { Router } from '@angular/router';
import { Article } from '../../interfaces/article';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  private articleService = inject(ArticleService);
  private router = inject(Router);

  allItems: Article[] = [];
  items: Article[] = [];

ngOnInit() {
  this.articleService.getAll().subscribe(data => {
    this.allItems = data.results;
    this.items = [...data.results];
  });
}
 goToCategory(categoryId: string) {
  this.router.navigate(['/articles'], {
    queryParams: { category_id: categoryId }
  });
}
}