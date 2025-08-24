import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { UserService } from './services/user.service';

export const userAuthGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const userService = inject(UserService);

  if (userService.isUserLoggedIn || localStorage.getItem('user')) {
    return true;
  } else {
    router.navigate(['/user-auth']);
    return false;
  }
};
