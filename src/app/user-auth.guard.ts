import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from './services/user.service';

export const userAuthGuard: CanActivateFn = () => {
  const userService = inject(UserService);
  const router = inject(Router);
  const user = localStorage.getItem('user');
  if (user) return true;
  router.navigate(['/user-auth']);
  return false;
};
