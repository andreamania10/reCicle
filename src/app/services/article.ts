import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ArticleService {

  apiUrl = 'https://proyecto-final-node-js86.onrender.com/api/articles';

  async getArticles(): Promise<any[]> {
    const response = await fetch(this.apiUrl);
    return await response.json();
  }

  async createArticle(article: any): Promise<any> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(article)
    });

    return await response.json();
  }
}
