import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  private articles: any[] = [];

  getArticles() {
    return this.articles;
  }

  createArticle(article: any) {
    this.articles.push(article);
  }
}
``