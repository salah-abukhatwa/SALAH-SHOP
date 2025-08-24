import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { SellerAuthComponent } from './seller-auth/seller-auth.component';
import { SellerHomeComponent } from './seller-home/seller-home.component';
import { authGuard } from './auth.guard';
import { SellerAddProductComponent } from './seller-add-product/seller-add-product.component';
import { SellerUpdateProductComponent } from './seller-update-product/seller-update-product.component';
import { SearchComponent } from './search/search.component';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { UserAuthComponent } from './user-auth/user-auth.component';
import { CartPageComponent } from './cart-page/cart-page.component';
import { CheckoutComponent } from './checkout/checkout.component';
import { OrdersComponent } from './orders/orders.component';
import { userAuthGuard } from './user-auth.guard';

export const routes: Routes = [
  {
    component: HomeComponent,
    path: '',
  },
  {
    component: SellerAuthComponent,
    path: 'seller-auth',
  },
  {
    component: SellerHomeComponent,
    path: 'seller-home',
    canActivate: [authGuard],
  },
  {
    component: SellerAddProductComponent,
    path: 'seller-add-product',
    canActivate: [authGuard],
  },
  {
    component: SellerUpdateProductComponent,
    path: 'seller-update-product/:id',
    canActivate: [authGuard],
  },
  {
    component: SearchComponent,
    path: 'search/:query',
  },
  {
    component: ProductDetailsComponent,
    path: 'details/:id',
  },
  {
    component: UserAuthComponent,
    path: 'user-auth',
  },
  {
    component: CartPageComponent,
    path: 'cart',
  },
  {
    component: CheckoutComponent,
    path: 'checkout',
    canActivate: [userAuthGuard],
  },
  {
    component: OrdersComponent,
    path: 'orders',
    canActivate: [userAuthGuard],
  },
];
