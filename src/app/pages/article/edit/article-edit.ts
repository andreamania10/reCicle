import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Article } from '../../../interfaces/article';
import { ArticleService } from '../../../services/article';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-article-edit',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './article-edit.html',
  styleUrl: './article-edit.css',
})
export class ArticleEdit implements OnInit {

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private articleService = inject(ArticleService);
  private auth = inject(Auth);
  private cdr = inject(ChangeDetectorRef);

  articleId!: number;
  loading = true;
  saving = false;
  notFound = false;
  errorMessage = '';

  title: string = '';
  description: string = '';
  price: number = 0;
  condition: string = '';
  status: string = '';
  location: string = '';

  ngOnInit() {
    this.articleId = Number(this.route.snapshot.paramMap.get('id'));

    this.articleService.getById(this.articleId).subscribe({
      next: (data: Article) => {
        this.title = data.title;
        this.description = data.description || '';
        this.price = Number(data.price);
        this.condition = data.condition || '';
        this.status = data.status || '';
        this.location = data.location || '';
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.notFound = true;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  save() {
    const currentUser = this.auth.currentUser();
    if (!currentUser?.token) {
      this.errorMessage = 'Debes iniciar sesión para guardar cambios.';
      return;
    }

    this.saving = true;
    this.errorMessage = '';

    const updatedArticle: Partial<Article> = {
      title: this.title,
      description: this.description,
      price: this.price,
      condition: this.condition,
      status: this.status,
      location: this.location,
    };

    this.articleService.update(this.articleId, updatedArticle as Article, currentUser.token).subscribe({
      next: () => {
        this.router.navigate(['/articles', this.articleId]);
      },
      error: () => {
        this.errorMessage = 'No se pudo guardar el artículo. Inténtalo de nuevo.';
        this.saving = false;
        this.cdr.detectChanges();
      }
    });
  }

  cancel() {
    this.router.navigate(['/articles', this.articleId]);
  }
}