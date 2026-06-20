import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ArticleService } from '../../../services/article';
import { Auth } from '../../../services/auth';
import { Article } from '../../../interfaces/article';

@Component({
  selector: 'app-article-create',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './article-create.html',
  styleUrl: './article-create.css',
})
export class ArticleCreate {

  private articleService = inject(ArticleService);
  private auth = inject(Auth);

  title: string = '';
  price: number = 0;
  condition: string = '';
  description: string = '';
  location: string = this.auth.currentUser()?.location ?? '';
  category_id: number = 1;

  save() {
    const newArticle: Article = {
      id: 0,
      user_id: 1,
      category_id: 1,
      title: this.title,
      price: String(this.price),
      condition: this.condition,
      description: this.description,
      location: this.location,
      status: 'available'
    };

    this.articleService.create(newArticle).subscribe(() => {
      console.log('Artículo guardado ✅');
    });
  }
}