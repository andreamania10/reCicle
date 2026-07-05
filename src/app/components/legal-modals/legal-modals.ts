import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-legal-modals',
  standalone: true,
  templateUrl: './legal-modals.html',
  styleUrl: './legal-modals.css',
})
export class LegalModalsComponent {
  showTermsModal = signal(false);
  showPrivacyModal = signal(false);

  openTermsModal(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.showTermsModal.set(true);
    this.lockBodyScroll();
  }

  openPrivacyModal(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.showPrivacyModal.set(true);
    this.lockBodyScroll();
  }

  closeTermsModal(): void {
    this.showTermsModal.set(false);
    this.unlockBodyScrollIfNeeded();
  }

  closePrivacyModal(): void {
    this.showPrivacyModal.set(false);
    this.unlockBodyScrollIfNeeded();
  }

  private lockBodyScroll(): void {
    document.body.style.overflow = 'hidden';
  }

  private unlockBodyScrollIfNeeded(): void {
    if (!this.showTermsModal() && !this.showPrivacyModal()) {
      document.body.style.overflow = '';
    }
  }
}
