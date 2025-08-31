import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SellerService } from './services/seller.service';

export const authGuard: CanActivateFn = (route, state) => {
  const sellerService = inject(SellerService);

  const router = inject(Router);

  let seller: string | null = null;

  if (typeof localStorage !== 'undefined') {
    seller = localStorage.getItem('seller');
  }

  if (seller) {
    return true;
  }

  return sellerService.isSellerLoggedIn;
};
