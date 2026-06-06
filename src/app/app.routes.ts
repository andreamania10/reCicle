import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { LoginModalComponent } from './components/login-modal/login-modal';
import { RegisterComponent } from './components/register/register';

// Afegeix aquests nous després
// import { ProfileComponent } from './components/profile/profile';
// import { AddArticleComponent } from './components/add-article/add-article';
// import { CategoriesComponent } from './components/categories/categories';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginModalComponent },
  { path: 'register', component: RegisterComponent },

  // Per fer avui 👇
  // { path: 'profile', component: ProfileComponent },
  // { path: 'add', component: AddArticleComponent },
  // { path: 'categories', component: CategoriesComponent }
];