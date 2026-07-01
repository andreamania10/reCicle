import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/']);
  }

  return true;
};

export const adminGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/']);
  }

  if (auth.currentUser()?.role !== 'Administrador') {
    return router.createUrlTree(['/home']);
  }

  return true;
};

export const moderatorGuard: CanActivateFn = () => {
  const auth = inject(Auth);
  const router = inject(Router);
  const role = auth.currentUser()?.role;

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/']);
  }

  if (role !== 'Moderador' && role !== 'Administrador') {
    return router.createUrlTree(['/']);
  }

  return true;
};
