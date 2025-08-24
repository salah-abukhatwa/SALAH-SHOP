import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Cart, Product } from '../model/product.model';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cart-page.component.html',
  styleUrl: './cart-page.component.css',
})
export class CartPageComponent implements OnInit {
  cartItems: (Cart & { product?: Product })[] = [];
  totalPrice: number = 0; // subtotal
  tax: number = 0;
  discount: number = 0;
  delivery: number = 20; // fixed delivery fee
  finalTotal: number = 0;

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.productService.getCartItems().subscribe((items) => {
      if (items.length && 'price' in items[0]) {
        this.cartItems = items as any;
        this.calculateTotal();
      } else {
        const cartItems = items as Cart[];
        if (!cartItems.length) {
          this.cartItems = [];
          this.resetSummary();
          this.router.navigate(['/']);
          return;
        }

        const productRequests = cartItems.map((item) =>
          this.productService.getProduct(item.productId.toString())
        );

        forkJoin(productRequests).subscribe((products) => {
          this.cartItems = cartItems.map((cart, index) => ({
            ...cart,
            product: products[index],
          }));
          this.calculateTotal();
        });
      }
      if (items.length === 0) {
        this.router.navigate(['/']);
      }
    });
  }

  calculateTotal(): void {
    const totals = this.productService.calculateCartTotals(this.cartItems);
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

  removeFromCart(cartId: number): void {
    const user = localStorage.getItem('user');
    if (user) {
      this.productService.deleteCartItem(cartId).subscribe(() => {
        this.loadCart();
      });
    } else {
      this.productService.localRemoveFromCart(cartId);
      this.loadCart();
    }
  }

  checkout(): void {
    this.router.navigate(['/checkout']);
  }
}
