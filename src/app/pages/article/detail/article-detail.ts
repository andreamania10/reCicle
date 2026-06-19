import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Article } from '../../../interfaces/article';
import { User } from '../../../interfaces/user';
import { ArticleService } from '../../../services/article';
import { UserService } from '../../../services/user';

@Component({
  selector: 'app-article-detail',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './article-detail.html',
  styleUrl: './article-detail.css',
})
export class ArticleDetail implements OnInit {

  private route = inject(ActivatedRoute);
  private articleService = inject(ArticleService);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  article: Article | null = null;
  seller: User | null = null;
  loading = true;
  notFound = false;

  statusOptions = ['Borrador', 'Publicado', 'En revisión', 'Retirado', 'Vendido'];
  newStatus: string = '';
  updatingStatus = false;
  statusError = '';

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    this.articleService.getById(id).subscribe({
      next: (data) => {
        this.article = data;
        this.newStatus = data.status || '';
        this.loading = false;
        this.loadSeller(data.user_id);
        this.cdr.detectChanges();
      },
      error: () => {
        this.notFound = true;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadSeller(userId: number) {
    this.userService.getAll().subscribe(users => {
      this.seller = users.find(u => u.id === userId) || null;
      this.cdr.detectChanges();
    });
  }

  updateStatus() {
    if (!this.article) return;

    this.updatingStatus = true;
    this.statusError = '';

    this.articleService.updateStatus(this.article.id, this.newStatus).subscribe({
      next: (updated) => {
        if (this.article) {
          this.article.status = updated.status || this.newStatus;
        }
        this.updatingStatus = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.statusError = 'No se pudo actualizar el estado.';
        this.updatingStatus = false;
        this.cdr.detectChanges();
      }
    });
  }
}