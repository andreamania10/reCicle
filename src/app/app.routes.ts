import { Routes } from '@angular/router';
<<<<<<< HEAD
import { HomeComponent } from './components/home/home.component';
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'registro', component: RegisterComponent },
];
=======

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home', loadComponent: () => import('./pages/home/home').then(m => m.Home) },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.Login) },
  { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.Register) },
  { path: 'categories', loadComponent: () => import('./pages/categories/categories').then(m => m.Categories) },
  { path: 'profile/:id', loadComponent: () => import('./pages/profile/profile').then(m => m.Profile) },
  { path: 'articles', loadComponent: () => import('./pages/article/list/article-list').then(m => m.ArticleList) },
  { path: 'articles/create', loadComponent: () => import('./pages/article/create/article-create').then(m => m.ArticleCreate) },
  { path: 'articles/edit/:id', loadComponent: () => import('./pages/article/edit/article-edit').then(m => m.ArticleEdit) },
  { path: 'articles/:id', loadComponent: () => import('./pages/article/detail/article-detail').then(m => m.ArticleDetail) },
  { path: 'messages', loadComponent: () => import('./pages/messages/messages').then(m => m.Messages) },
  { path: 'favorites', loadComponent: () => import('./pages/favorites/favorites').then(m => m.Favorites) },
  { path: 'moderator', loadComponent: () => import('./pages/moderator-panel/moderator-panel').then(m => m.ModeratorPanel) },
  { path: 'admin', loadComponent: () => import('./pages/admin-panel/admin-panel').then(m => m.AdminPanel) },
  { path: '**', redirectTo: 'home' }
];
>>>>>>> origin/main
