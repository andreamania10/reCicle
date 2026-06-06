import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Article } from '../../../interfaces/article';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-article-list',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './article-list.html',
  styleUrl: './article-list.css',
})
export class ArticleList implements OnInit {

  categories = ['Todas', 'Ropa', 'Electrónica', 'Hogar', 'Deportes', 'Libros'];
  selectedCategory = 'Todas';

  allArticles: Article[] = [
    { id: 1, title: 'Camiseta azul', category: 'Ropa', price: 5, image: 'https://placehold.co/300x200' },
    { id: 2, title: 'Portátil HP', category: 'Electrónica', price: 350, image: 'https://placehold.co/300x200' },
    { id: 3, title: 'Silla de escritorio', category: 'Hogar', price: 40, image: 'https://placehold.co/300x200' },
    { id: 4, title: 'Bicicleta de montaña', category: 'Deportes', price: 120, image: 'https://placehold.co/300x200' },
    { id: 5, title: 'Harry Potter', category: 'Libros', price: 8, image: 'https://placehold.co/300x200' },
    { id: 6, title: 'Pantalón vaquero', category: 'Ropa', price: 12, image: 'https://placehold.co/300x200' },
  ];

  filteredArticles: Article[] = [];

  ngOnInit() {
    this.filteredArticles = this.allArticles;
  }

  filterByCategory(category: string) {
    this.selectedCategory = category;
    if (category === 'Todas') {
      this.filteredArticles = this.allArticles;
    } else {
      this.filteredArticles = this.allArticles.filter(a => a.category === category);
    }
  }
}