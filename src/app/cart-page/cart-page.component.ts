import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { Cart, Product } from '../model/product.model';
import { CartService } from '../services/cart.service';
import { ProductService } from '../services/product.service';
import { catchError } from 'rxjs/operators';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-page.component.html',
  styleUrls: ['./cart-page.component.css'],
})
export class CartPageComponent implements OnInit {
  cartItems: (Cart & { product?: Product })[] = [];
  totalPrice = 0;
  tax = 0;
  discount = 0;
  delivery = 20;
  finalTotal = 0;

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    const userStore = localStorage.getItem('user');
    const userId = userStore ? JSON.parse(userStore).id : null;

    if (userId) {
      this.cartService.getCart(userId).subscribe((items) => {
        if (!items.length) {
          this.cartItems = [];
          this.resetSummary();
          this.router.navigate(['/']);
          return;
        }

        const requests = items.map((item) =>
          this.productService
            .getProduct(item.productId)
            .pipe(catchError(() => of(null)))
        );

        combineLatest(requests).subscribe((products) => {
          this.cartItems = items
            .map((item, i) => {
              const product = products[i];
              if (!product) {
                console.warn(
                  'Product not found for cart item:',
                  item.productId
                );
                return null;
              }
              return { ...item, product };
            })
            .filter(
              (item): item is Cart & { product: Product } => item !== null
            );
          this.calculateTotal();
        });
      });
    } else {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      this.cartItems = localCart.map((item: any) => ({
        ...item,
        product: {
          id: item.id,
          name: item.name,
          price: item.price,
          image: item.image,
          color: item.color || '',
          category: item.category || '',
          description: item.description || '',
          discount: item.discount ?? 0,
        } as Product,
      }));
      this.calculateTotal();
    }
  }

  calculateTotal(): void {
    const totals = this.cartService.calculateCartTotals(this.cartItems);
    this.totalPrice = totals.total;

    // new fields if you want to show in cart
    this.tax = totals.tax;
    this.discount = totals.discount;
    this.delivery = totals.delivery;
  }

  resetSummary(): void {
    this.totalPrice = 0;
    this.discount = 0;
    this.tax = 0;
    this.delivery = 20;
    this.finalTotal = 0;
  }

  removeFromCart(cartId: string): void {
    const userStore = localStorage.getItem('user');
    const userId = userStore ? JSON.parse(userStore).id : null;

    if (userId) {
      this.cartService.deleteCartItem(cartId).subscribe(() => this.loadCart());
    } else {
      this.cartService.removeLocalCartItem(cartId);
      this.loadCart();
    }
  }

  checkout(): void {
    this.router.navigate(['/checkout']);
  }
}
