import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-article-card',
  standalone: true,
  templateUrl: './article-card.html',
  styleUrl: './article-card.css'
})
export class ArticleCardComponent {
  @Input() item: any;
}