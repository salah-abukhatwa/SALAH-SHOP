import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { Cart, order, Product } from '../model/product.model';
import { forkJoin } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  deliveryOption: 'delivery' | 'pickup' = 'delivery';
  cartItems: (Cart & { product?: Product })[] = [];
  totalPrice: number = 0; // subtotal
  tax: number = 0;
  discount: number = 0;
  delivery: number = 20; // fixed delivery fee
  finalTotal: number = 0;

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.productService.getCartItems().subscribe((items) => {
      console.log('Cart items:', items);

      // Case 1: Guest user → already has full product info
      if (items.length && 'price' in items[0]) {
        this.cartItems = items.map((item: any) => ({
          ...item,
          product: { ...item } as Product, // wrap product
        }));
        this.calculateTotals();
      }
      // Case 2: Logged-in user → need to fetch product info
      else {
        const cartItems = items as Cart[];
        if (!cartItems.length) {
          this.cartItems = [];
          this.totalPrice = 0;
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
          this.calculateTotals();
        });
      }
    });
  }

  calculateTotals(): void {
    const totals = this.productService.calculateCartTotals(this.cartItems);
    this.totalPrice = totals.subtotal;
    this.tax = totals.tax;
    this.delivery = totals.delivery;
    this.discount = totals.discount;
    this.finalTotal = totals.total;
  }

  orderNow(data: { email: string; address: string; contact: string }) {
    let user: string | null = null;

    if (typeof localStorage !== 'undefined') {
      user = localStorage.getItem('user');
    }
    let userData = user && JSON.parse(user)[0];

    if (this.totalPrice && userData) {
      let orderData: order = {
        ...data,
        totalPrice: this.totalPrice,
        userId: userData.id,
        id: undefined,
      };

      this.productService.placeOrder(orderData).subscribe((result) => {
        console.log('✅ Order placed:', result);
        alert('Order placed successfully!');
        localStorage.removeItem('cart');
        this.productService.deleteCartItem(orderData.userId).subscribe(() => {
          this.productService.cartData.next([]);
          alert('Order placed successfully!');
          this.router.navigate(['/orders']);
        });
      });
    } else {
      alert('Something went wrong. Please login or check total.');
    }
  }
}
