import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from './services/user.service';

export const userAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userService = inject(UserService);

  let user: string | null = null;

  if (typeof localStorage !== 'undefined') {
    user = localStorage.getItem('user');
  }

  if (userService.isUserLoggedIn || user) {
    return true;
  } else {
    router.navigate(['/user-auth']);
    return false;
  }
};
