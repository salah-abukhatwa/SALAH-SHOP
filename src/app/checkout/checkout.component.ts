import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cart, Order, Product } from '../model/product.model';
import { CartService } from '../services/cart.service';
import { ProductService } from '../services/product.service';
import { OrderService } from '../services/order.service';
import { catchError, of, combineLatest } from 'rxjs';
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
  totalPrice = 0;
  tax = 0;
  discount = 0;
  delivery = 20;
  finalTotal = 0;

  constructor(
    private cartService: CartService,
    private productService: ProductService,
    private orderService: OrderService,
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
          alert('Your cart is empty. Please add items before checking out.');
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

  setDeliveryOption(option: 'delivery' | 'pickup') {
    this.deliveryOption = option;
    this.calculateTotal();
  }

  calculateTotal(): void {
    const totals = this.cartService.calculateCartTotals(this.cartItems);
    this.totalPrice = totals.subtotal;
    this.tax = totals.tax;
    this.discount = totals.discount;
    this.delivery = this.deliveryOption === 'delivery' ? 20 : 0;
    this.finalTotal =
      this.totalPrice + this.tax + this.delivery - this.discount;
  }

  resetSummary(): void {
    this.totalPrice = 0;
    this.tax = 0;
    this.discount = 0;
    this.delivery = 20;
    this.finalTotal = 0;
  }

  orderNow(data: { email: string; address: string; contact: string }) {
    const userStore = localStorage.getItem('user');
    const userData = userStore ? JSON.parse(userStore) : null;

    if (!this.finalTotal || !userData) {
      alert(
        'You need to log in or create an account to complete your purchase.'
      );
      return;
    }

    const orderData: Omit<Order, 'id'> = {
      ...data,
      totalPrice: this.finalTotal,
      userId: userData.id,
      items: this.cartItems.map(({ product, ...rest }) => rest),
    };

    this.orderService.placeOrder(orderData).subscribe({
      next: () => {
        this.cartService.getCart(userData.id).subscribe((cartItems) => {
          const deleteRequests = cartItems.map((item) =>
            this.cartService.deleteCartItem(item.id!)
          );
          combineLatest(deleteRequests).subscribe(() => {
            this.cartService.cartData.next([]);
            localStorage.removeItem('cart');
            alert('Order placed successfully!');
            this.router.navigate(['/orders']);
            setTimeout(() => {
              window.location.reload();
            }, 100);
          });
        });
      },
      error: (err) => {
        console.error('Order failed:', err);
        alert(
          'Failed to place order. Please check your connection or permissions.'
        );
      },
    });
  }
}
