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

export const profileGuard: CanActivateFn = (route) => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    return router.createUrlTree(['/']);
  }

  const user = auth.currentUser();
  const profileId = Number(route.paramMap.get('id'));

  if (!user?.id || !profileId || profileId !== user.id) {
    return user?.id ? router.createUrlTree(['/profile', user.id]) : router.createUrlTree(['/']);
  }

  return true;
};
