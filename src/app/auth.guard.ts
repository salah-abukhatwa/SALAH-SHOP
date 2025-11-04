import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { SellerService } from './services/seller.service';

export const authGuard: CanActivateFn = () => {
  const sellerService = inject(SellerService);
  const router = inject(Router);
  const seller = localStorage.getItem('seller');
  if (seller) return true;
  router.navigate(['/seller-auth']);
  return false;
};
