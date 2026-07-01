import { ChangeDetectorRef, Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { finalize } from 'rxjs';
import { ArticleService } from '../../services/article';
import { Auth } from '../../services/auth';
import { CategoryService } from '../../services/category';
import { Category } from '../../interfaces/category';

interface AttachedImage {
  file: File;
  previewUrl: string;
}

@Component({
  selector: 'app-sell-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './sell-products.html',
  styleUrls: ['./sell-products.css'],
})
export class SellProducts implements OnInit, OnDestroy {
  private articleService = inject(ArticleService);
  private categoryService = inject(CategoryService);
  private router = inject(Router);
  private auth = inject(Auth);
  private cdr = inject(ChangeDetectorRef);

  readonly maxImages = 5;
  readonly conditionOptions = ['Nuevo', 'Como nuevo', 'Buen estado', 'Aceptable'];
  readonly acceptedImageTypes = 'image/jpeg,image/png,image/webp,image/gif';

  isPublishing = false;
  successMessage = '';
  errorMessage = '';
  formSubmitted = false;

  categories: Category[] = [];
  loadingCategories = true;
  categoriesError = false;

  product = {
    title: '',
    description: '',
    price: null as number | null,
    category_id: null as number | null,
    condition: 'Nuevo',
    location: this.auth.currentUser()?.location ?? '',
  };

  attachedImages: AttachedImage[] = [];

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.loadingCategories = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.categoriesError = true;
        this.loadingCategories = false;
        this.cdr.detectChanges();
      },
    });
  }

  ngOnDestroy(): void {
    this.revokeAllPreviews();
  }

  get buttonText(): string {
    return this.isPublishing ? 'Guardando...' : 'Guardar';
  }

  get canAddImage(): boolean {
    return this.attachedImages.length < this.maxImages;
  }

  selectCondition(option: string): void {
    this.product.condition = option;
  }

  isConditionSelected(option: string): boolean {
    return this.product.condition === option;
  }

  get remainingSlots(): number {
    return this.maxImages - this.attachedImages.length;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files?.length) {
      return;
    }

    this.errorMessage = '';
    const availableSlots = this.remainingSlots;

    for (let i = 0; i < Math.min(files.length, availableSlots); i++) {
      this.addImageFile(files[i]);
    }

    if (files.length > availableSlots) {
      this.errorMessage = `Solo se permiten ${this.maxImages} imágenes. Se añadieron ${availableSlots}.`;
    }

    input.value = '';
    this.cdr.detectChanges();
  }

  removeImage(index: number): void {
    const image = this.attachedImages[index];
    if (image) {
      URL.revokeObjectURL(image.previewUrl);
    }
    this.attachedImages.splice(index, 1);
    this.cdr.detectChanges();
  }

  hasImages(): boolean {
    return this.attachedImages.length > 0;
  }

  isFormInvalid(): boolean {
    return (
      !this.product.title.trim() ||
      !this.product.description.trim() ||
      this.product.price === null ||
      this.product.price < 0 ||
      !this.product.category_id ||
      !this.product.condition ||
      !this.product.location.trim() ||
      !this.hasImages()
    );
  }

  submitProduct(): void {
    this.formSubmitted = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.isFormInvalid()) {
      this.errorMessage = this.getFormValidationError();
      this.cdr.detectChanges();
      return;
    }

    const currentUser = this.auth.currentUser();
    if (!currentUser?.token) {
      this.errorMessage = 'Debes iniciar sesión para publicar.';
      this.cdr.detectChanges();
      return;
    }

    this.isPublishing = true;
    const formData = this.buildArticleFormData();

    this.articleService
      .createWithMedia(formData, currentUser.token)
      .pipe(
        finalize(() => {
          this.isPublishing = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Producto publicado correctamente.';
          this.cdr.detectChanges();

          setTimeout(() => {
            this.router.navigate(['/home']);
          }, 1000);
        },
        error: (err) => {
          this.errorMessage = this.extractErrorMessage(
            err,
            'Error al publicar el producto.',
          );
          this.cdr.detectChanges();
        },
      });
  }

  private addImageFile(file: File): void {
    if (!file.type.startsWith('image/')) {
      this.errorMessage = `"${file.name}" no es una imagen válida. Usa JPG, PNG, WEBP o GIF.`;
      return;
    }

    if (this.attachedImages.length >= this.maxImages) {
      return;
    }

    this.attachedImages.push({
      file,
      previewUrl: URL.createObjectURL(file),
    });
  }

  private buildArticleFormData(): FormData {
    const formData = new FormData();
    formData.append('title', this.product.title.trim());
    formData.append('description', this.product.description.trim());
    formData.append('price', this.product.price!.toFixed(2));
    formData.append('category_id', String(this.product.category_id));
    formData.append('condition', this.product.condition);
    formData.append('location', this.product.location.trim());

    this.attachedImages.forEach(({ file }) => {
      formData.append('images', file, file.name);
    });

    return formData;
  }

  private revokeAllPreviews(): void {
    this.attachedImages.forEach(({ previewUrl }) => URL.revokeObjectURL(previewUrl));
  }

  private getFormValidationError(): string {
    if (!this.product.title.trim()) {
      return 'El nombre del producto es obligatorio.';
    }
    if (!this.product.description.trim()) {
      return 'La descripción es obligatoria.';
    }
    if (this.product.price === null || this.product.price < 0) {
      return 'Indica un precio válido.';
    }
    if (!this.product.category_id) {
      return 'Selecciona una categoría.';
    }
    if (!this.product.condition) {
      return 'Selecciona la condición del producto.';
    }
    if (!this.product.location.trim()) {
      return 'La locación es obligatoria.';
    }
    if (!this.hasImages()) {
      return 'Adjunta al menos una imagen del producto.';
    }
    return 'Completa todos los campos obligatorios.';
  }

  private extractErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    if (!error || typeof error !== 'object') {
      return fallback;
    }

    const httpError = error as {
      error?: unknown;
      message?: string;
      status?: number;
    };

    const payload = httpError.error;

    if (typeof payload === 'string' && payload.trim()) {
      return payload;
    }

    if (payload && typeof payload === 'object') {
      const record = payload as Record<string, unknown>;
      const message = record['message'] ?? record['error'] ?? record['msg'];
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
      if (Array.isArray(record['errors']) && record['errors'].length > 0) {
        return record['errors'].map(String).join('. ');
      }
    }

    if (typeof httpError.message === 'string' && httpError.message.trim()) {
      return httpError.message;
    }

    if (httpError.status) {
      return `${fallback} (HTTP ${httpError.status})`;
    }

    return fallback;
  }
}
