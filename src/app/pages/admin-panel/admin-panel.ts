import { Component, OnInit, signal, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminService, AdminStats, AdminUser } from '../../services/admin';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-panel.html',
  styleUrl: './admin-panel.css',
})
export class AdminPanel implements OnInit {
  private cdr = inject(ChangeDetectorRef);

  activeTab = signal<'stats' | 'users' | 'categories'>('stats');

  // Estadísticas
  stats = signal<AdminStats | null>(null);

  // Usuarios
  users = signal<AdminUser[]>([]);
  selectedUser = signal<AdminUser | null>(null);
  newRole = signal('');
  editingUser = signal<AdminUser | null>(null);
  editUserData = { username: '', email: '', location: '', password: '' };
  showEditPassword = false;

  // Categorías
  categories = signal<any[]>([]);
  newCategoryName = '';
  newCategorySlug = '';
  editingCategory = signal<any | null>(null);
  editCategoryName = '';
  editCategorySlug = '';

  // UI
  loading = signal(false);
  successMsg = signal('');
  errorMsg = signal('');

  readonly roles = ['Usuario', 'Moderador', 'Administrador'];

  constructor(private adminService: AdminService, private router: Router) {}

  goToStat(stat: 'articles' | 'users' | 'sold'): void {
    if (stat === 'users') { this.setTab('users'); return; }
    if (stat === 'sold') { this.router.navigate(['/admin/sold']); return; }
    this.router.navigate(['/home']);
  }

  ngOnInit(): void {
    this.loadStats();
  }

  setTab(tab: 'stats' | 'users' | 'categories'): void {
    this.activeTab.set(tab);
    this.clearMessages();
    if (tab === 'stats') this.loadStats();
    if (tab === 'users') this.loadUsers();
    if (tab === 'categories') this.loadCategories();
  }

  // --- Estadísticas ---
  loadStats(): void {
    this.adminService.getStats().subscribe({
      next: (data) => this.stats.set(data),
      error: () => this.showError('Error al cargar estadísticas'),
    });
  }

  // --- Usuarios ---
  loadUsers(): void {
    this.loading.set(true);
    this.adminService.getUsers().subscribe({
      next: (data: any) => {
        const arr = Array.isArray(data) ? data : (data?.results ?? data?.data ?? data?.users ?? []);
        this.users.set(arr);
        this.loading.set(false);
      },
      error: () => { this.showError('Error al cargar usuarios'); this.loading.set(false); },
    });
  }

  openEditUser(user: AdminUser): void {
    this.editingUser.set(user);
    this.editUserData = { username: user.username, email: user.email, location: user.location ?? '', password: '' };
    this.showEditPassword = false;
  }

  saveEditUser(): void {
    const user = this.editingUser();
    if (!user) return;

    const body = {
      username: this.editUserData.username,
      email: this.editUserData.email,
      location: this.editUserData.location,
    };
    const newPassword = this.editUserData.password.trim();

    this.adminService.updateUser(user.id, body).subscribe({
      next: () => {
        if (!newPassword) {
          this.showSuccess('Usuario actualizado');
          this.editingUser.set(null);
          this.loadUsers();
          return;
        }

        // La contraseña se gestiona en un endpoint independiente,
        // solo accesible para Administrador, sin necesidad de la contraseña actual.
        this.adminService.changeUserPassword(user.id, newPassword).subscribe({
          next: () => {
            this.showSuccess('Usuario y contraseña actualizados');
            this.editingUser.set(null);
            this.loadUsers();
          },
          error: (err) => {
            this.showError(
              err?.error?.message || 'Los datos se guardaron, pero no se pudo cambiar la contraseña',
            );
            this.editingUser.set(null);
            this.loadUsers();
          },
        });
      },
      error: () => this.showError('Error al actualizar usuario'),
    });
  }

  openRoleModal(user: AdminUser): void {
    this.selectedUser.set(user);
    this.newRole.set(user.role);
  }

  saveRole(): void {
    const user = this.selectedUser();
    if (!user) return;
    this.adminService.updateUserRole(user.id, this.newRole()).subscribe({
      next: () => {
        this.showSuccess('Rol actualizado');
        this.selectedUser.set(null);
        this.loadUsers();
      },
      error: () => this.showError('Error al actualizar rol'),
    });
  }

  toggleBlock(user: AdminUser): void {
    const action = user.status === 'Bloqueado'
      ? this.adminService.unblockUser(user.id)
      : this.adminService.blockUser(user.id);

    action.subscribe({
      next: () => {
        this.showSuccess(user.status === 'Bloqueado' ? 'Usuario desbloqueado' : 'Usuario bloqueado');
        this.loadUsers();
      },
      error: () => this.showError('Error al cambiar estado del usuario'),
    });
  }

  deleteUser(userId: number): void {
    if (!confirm('¿Eliminar este usuario? Esta acción no se puede deshacer.')) return;
    this.adminService.deleteUser(userId).subscribe({
      next: () => { this.showSuccess('Usuario eliminado'); this.loadUsers(); },
      error: () => this.showError('Error al eliminar usuario'),
    });
  }

  // --- Categorías ---
  loadCategories(): void {
    this.loading.set(true);
    this.adminService.getCategories().subscribe({
      next: (data: any) => {
        const arr = Array.isArray(data) ? data : (data?.results ?? data?.data ?? data?.categories ?? []);
        this.categories.set(arr);
        this.loading.set(false);
      },
      error: () => { this.showError('Error al cargar categorías'); this.loading.set(false); },
    });
  }

  createCategory(): void {
    if (!this.newCategoryName.trim()) return;
    const slug = this.newCategorySlug.trim() || this.toSlug(this.newCategoryName);
    this.adminService.createCategory(this.newCategoryName.trim(), slug).subscribe({
      next: () => {
        this.showSuccess('Categoría creada');
        this.newCategoryName = '';
        this.newCategorySlug = '';
        this.loadCategories();
      },
      error: () => this.showError('Error al crear categoría'),
    });
  }

  openEditCategory(cat: any): void {
    this.editingCategory.set(cat);
    this.editCategoryName = cat.name;
    this.editCategorySlug = cat.slug;
  }

  saveCategory(): void {
    const cat = this.editingCategory();
    if (!cat) return;
    this.adminService.updateCategory(cat.id, this.editCategoryName, this.editCategorySlug).subscribe({
      next: () => {
        this.showSuccess('Categoría actualizada');
        this.editingCategory.set(null);
        this.loadCategories();
      },
      error: () => this.showError('Error al actualizar categoría'),
    });
  }

  deleteCategory(id: number): void {
    if (!confirm('¿Eliminar esta categoría?')) return;
    this.adminService.deleteCategory(id).subscribe({
      next: () => { this.showSuccess('Categoría eliminada'); this.loadCategories(); },
      error: () => this.showError('Error al eliminar categoría'),
    });
  }

  // --- Helpers ---
  private toSlug(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
  }

  private showSuccess(msg: string): void {
    this.successMsg.set(msg);
    this.errorMsg.set('');
    setTimeout(() => this.successMsg.set(''), 3000);
  }

  private showError(msg: string): void {
    this.errorMsg.set(msg);
    this.successMsg.set('');
  }

  private clearMessages(): void {
    this.successMsg.set('');
    this.errorMsg.set('');
  }
}
