import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../../services/article';

@Component({
  selector: 'app-article-create',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './article-create.html',
  styleUrl: './article-create.css',
})
export class ArticleCreate {
  title: string = '';
  price: number = 0;
  category: string = '';

  constructor(private articleService: ArticleService) {}

  save() {
    this.articleService.createArticle({
      title: this.title,
      price: String(this.price),
      category: this.category,
    });

    console.log('Artículo guardado ✅');
  }
}