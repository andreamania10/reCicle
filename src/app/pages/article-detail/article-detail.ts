import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { RouterLink } from '@angular/router';
import { Article } from '../../interfaces/article';

@Component({
  selector: 'app-article-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './article-detail.html',
  styleUrl: './article-detail.css',
})
export class ArticleDetail implements OnInit {

  article: Article | null = null;

  // Datos de prueba (igual que en article-list)
  allArticles: Article[] = [
    { id: 1, title: 'Camiseta azul', category: 'Ropa', price: 5, image: 'https://placehold.co/300x200', description: 'Camiseta azul talla M en buen estado.' },
    { id: 2, title: 'Portátil HP', category: 'Electrónica', price: 350, image: 'https://placehold.co/300x200', description: 'Portátil HP i5, 8GB RAM, 256GB SSD.' },
    { id: 3, title: 'Silla de escritorio', category: 'Hogar', price: 40, image: 'https://placehold.co/300x200', description: 'Silla ergonómica, muy cómoda.' },
    { id: 4, title: 'Bicicleta de montaña', category: 'Deportes', price: 120, image: 'https://placehold.co/300x200', description: 'Bicicleta de montaña 26 pulgadas.' },
    { id: 5, title: 'Harry Potter', category: 'Libros', price: 8, image: 'https://placehold.co/300x200', description: 'Libro Harry Potter y la piedra filosofal.' },
    { id: 6, title: 'Pantalón vaquero', category: 'Ropa', price: 12, image: 'https://placehold.co/300x200', description: 'Pantalón vaquero azul talla 38.' },
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.article = this.allArticles.find(a => a.id === id) || null;
  }
}