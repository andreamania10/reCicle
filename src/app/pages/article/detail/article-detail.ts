import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Article } from '../../../interfaces/article';

@Component({
  selector: 'app-article-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './article-detail.html',
  styleUrl: './article-detail.css',
})
export class ArticleDetail implements OnInit {

  article: Article | null = null;

  allArticles: Article[] = [
    { id: 1, user_id: 1, category_id: 7, title: 'iPhone 13', description: 'iPhone 13 128GB', price: 450, condition: 'bueno', status: 'available', location: 'Barcelona', image: 'https://placehold.co/300x200' },
    { id: 2, user_id: 1, category_id: 8, title: 'Portátil HP', description: 'HP i5 8GB RAM', price: 350, condition: 'muy bueno', status: 'available', location: 'Madrid', image: 'https://placehold.co/300x200' },
    { id: 3, user_id: 2, category_id: 9, title: 'Camiseta azul', description: 'Talla M', price: 5, condition: 'bueno', status: 'available', location: 'Valencia', image: 'https://placehold.co/300x200' },
    { id: 4, user_id: 2, category_id: 10, title: 'Pantalón vaquero', description: 'Talla 38', price: 12, condition: 'nuevo', status: 'available', location: 'Sevilla', image: 'https://placehold.co/300x200' },
    { id: 5, user_id: 3, category_id: 4, title: 'Silla escritorio', description: 'Silla ergonómica', price: 40, condition: 'bueno', status: 'available', location: 'Manresa', image: 'https://placehold.co/300x200' },
    { id: 6, user_id: 3, category_id: 6, title: 'Harry Potter', description: 'Piedra filosofal', price: 8, condition: 'bueno', status: 'available', location: 'Barcelona', image: 'https://placehold.co/300x200' },
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.article = this.allArticles.find(a => a.id === id) || null;
  }
}