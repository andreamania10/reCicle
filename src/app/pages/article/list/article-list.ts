import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Article } from '../../../interfaces/article';
import { Category, CategoryResponse } from '../../../interfaces/category';
import { ArticleService } from '../../../services/article';
import { CategoryService } from '../../../services/category';

@Component({
  selector: 'app-article-list',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './article-list.html',
  styleUrl: './article-list.css',
})
export class ArticleList implements OnInit {

  private articleService = inject(ArticleService);
  private categoryService = inject(CategoryService);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);


  categories: Category[] = [];
  subCategories: Category[] = [];
  selectedCategoryId: number | null = null;
  selectedSubCategoryId: number | null = null;
  filteredSubCategories: Category[] = [];

  minPrice: number = 0;
  maxPrice: number = 1000;
  searchTitle: string = '';
  selectedCondition: string = '';

  allArticles: Article[] = [];
  filteredArticles: Article[] = [];

ngOnInit() {
  this.categoryService.getAll().subscribe((data: CategoryResponse) => {
    this.categories = data.categories;
    this.subCategories = [];
  });

  this.articleService.getAll().subscribe(data => {
    this.allArticles = data.results;
    console.log('Artículos recibidos:', this.allArticles);
    this.applyFilters();
    this.cdr.detectChanges();
  });

  this.route.queryParams.subscribe(params => {
    if (params['category_id']) {
      this.selectedCategoryId = Number(params['category_id']);
    }
  });
}
  selectCategory(categoryId: number | null) {
    this.selectedCategoryId = categoryId;
    this.selectedSubCategoryId = null;
    this.updateSubCategories();
    this.applyFilters();
  }

  selectSubCategory(subCategoryId: number | null) {
    this.selectedSubCategoryId = subCategoryId;
    this.applyFilters();
  }

  updateSubCategories() {
    this.filteredSubCategories = this.subCategories.filter(s => s.parent_id === this.selectedCategoryId);
  }

 applyFilters() {
  console.log('allArticles:', this.allArticles.length);
  this.filteredArticles = this.allArticles.filter(a => {
    const price = Number(a.price);
    if (this.selectedCategoryId !== null && a.category_id !== this.selectedCategoryId) return false;
    if (price < this.minPrice || price > this.maxPrice) return false;
    if (this.searchTitle && !a.title.toLowerCase().includes(this.searchTitle.toLowerCase())) return false;
    if (this.selectedCondition && a.condition !== this.selectedCondition) return false;
    return true;
  });
  console.log('filteredArticles:', this.filteredArticles.length);
}}