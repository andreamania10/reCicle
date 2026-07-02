import { Routes } from '@angular/router';
import { adminGuard, authGuard, moderatorGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.Register) },
  { path: 'categories', loadComponent: () => import('./pages/categories/categories').then(m => m.Categories) },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile').then(m => m.Profile),
    canActivate: [authGuard],
  },
  { path: 'profile/:id', redirectTo: 'profile', pathMatch: 'full' },
  { path: 'articles/edit/:id', loadComponent: () => import('./pages/article/edit/article-edit').then(m => m.ArticleEdit) },
  { path: 'articles/:id', loadComponent: () => import('./pages/article/detail/article-detail').then(m => m.ArticleDetail) },
  { path: 'messages', loadComponent: () => import('./pages/messages/messages').then(m => m.Messages), canActivate: [authGuard] },
  { path: 'messages/:id', loadComponent: () => import('./pages/messages/messages').then(m => m.Messages), canActivate: [authGuard] },
  { path: 'favorites', loadComponent: () => import('./pages/favorites/favorites').then(m => m.Favorites) },
  { path: 'moderator', loadComponent: () => import('./pages/moderator-panel/moderator-panel').then(m => m.ModeratorPanel), canActivate: [moderatorGuard] },
  { path: 'admin', loadComponent: () => import('./pages/admin-panel/admin-panel').then(m => m.AdminPanel), canActivate: [adminGuard] },
  { path: 'admin/sold', loadComponent: () => import('./pages/admin-sold-articles/admin-sold-articles').then(m => m.AdminSoldArticles), canActivate: [adminGuard] },
  {
    path: 'sellProduct',
    loadComponent: () => import('./pages/sell-products/sell-products').then(m => m.SellProducts),
    canActivate: [authGuard],
  },
  { path: 'ourteam', loadComponent: () => import('./pages/ourteam/ourteam').then(m => m.Ourteam) },
  { path: '**', redirectTo: '' }
];
