import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { ArticleService } from '../../services/article';
import { HttpEventType, HttpUploadProgressEvent } from '@angular/common/http';
import { Auth } from '../../services/auth'; 

@Component({
  selector: 'app-sell-products',
  standalone: true,
  imports: [FormsModule, NgIf],
  templateUrl: './sell-products.html',
  styleUrls: ['./sell-products.css']
})
export class SellProducts {
  private articleService = inject(ArticleService);
  private router = inject(Router);
  private auth = inject(Auth);
  isPublishing = false;
  successMessage = '';
  uploadProgress = 0;
  formSubmitted = false;

  get buttonText(): string {
    if (this.isPublishing) {
      return `Publicando... ${this.uploadProgress}%`;
    }
    return 'Publicar';
  }
  
  product = {
    name: '',
    description: '',
    price: null as number | null,
    category_id: null as number | null,
    condition: '',
    location: ''
  };

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isImage = false;
  isVideo = false;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (!input.files || input.files.length === 0) {
      return;
    }

    const file = input.files[0];
    this.selectedFile = file;

    this.previewUrl = URL.createObjectURL(file);
    this.isImage = file.type.startsWith('image/');
    this.isVideo = file.type.startsWith('video/');
  }

  
  submitProduct(): void {
    this.formSubmitted = true;
  
    if (
      !this.product.name ||
      !this.product.description ||
      !this.product.price ||
      !this.product.category_id ||
      !this.product.condition ||
      !this.product.location
    ) {
      return;
    }
  
    this.isPublishing = true;
    this.successMessage = '';
  
    const formData = new FormData();
    formData.append('title', this.product.name);
    formData.append('description', this.product.description);
    formData.append('price', String(this.product.price));
    formData.append('category_id', String(this.product.category_id));
    formData.append('condition', this.product.condition);
    formData.append('location', this.product.location);
    
  
    if (this.selectedFile) {
      formData.append('media', this.selectedFile);
    }
  
    const currentUser = this.auth.currentUser();
      if (!currentUser?.token) {
          this.successMessage = 'Debes iniciar sesión para publicar.';
          this.isPublishing = false;
      return;
}


this.articleService.createWithMedia(formData, currentUser.token).subscribe({
      next: (event) => {
    
        if (event.type === HttpEventType.Sent) {
          console.log('Enviant request...');
        }
    
        if (event.type === HttpEventType.UploadProgress) {
          const uploadEvent = event as HttpUploadProgressEvent;
    
          const total = uploadEvent.total ?? 1;
          const loaded = uploadEvent.loaded ?? 0;
    
          this.uploadProgress = Math.round((100 * loaded) / total);
        }
    
        if (event.type === HttpEventType.Response) {
          console.log('Resposta rebuda ✅');
    
          this.isPublishing = false;
          this.uploadProgress = 100;
          this.successMessage = 'Producto publicado correctamente ✅';
    
          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 1000);
        }
      },
      error: (err) => {
        console.error('Error al publicar ❌', err);
    
        this.isPublishing = false;
        this.successMessage = 'Error al publicar el producto ❌';
      }
    });
  }

  resetForm(): void {
    this.product = {
      name: '',
      description: '',
      price: null,
      category_id: null,
      condition: '',
      location: ''
    };

    this.selectedFile = null;
    this.previewUrl = null;
    this.isImage = false;
    this.isVideo = false;
  }
}