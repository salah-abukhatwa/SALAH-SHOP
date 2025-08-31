import { Injectable } from '@angular/core';
import { Cart, order, Product } from '../model/product.model';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  cartData = new BehaviorSubject<Cart[]>([]);
  private apiUrl = environment.apiUrl;
  constructor(private http: HttpClient) {}

  addProduct(data: Product): Observable<Object> {
    return this.http.post(`${this.apiUrl}/products`, data);
  }

  productList(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products`);
  }

  deleteProduct(id: number): Observable<Object> {
    return this.http.delete(`${this.apiUrl}/products/${id}`);
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  updateProduct(id: string, data: Product): Observable<Object> {
    return this.http.put(`${this.apiUrl}/products/${id}`, data);
  }

  popularProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products?_limit=3`);
  }

  trendyProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products?_limit=8`);
  }

  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.apiUrl}/products?q=${query}`);
  }

  // -------------------- CART METHODS --------------------
  localAddToCart(data: Product): void {
    if (typeof localStorage !== 'undefined') {
      let cartData = JSON.parse(localStorage.getItem('cart') || '[]');
      const existingProduct = cartData.find(
        (item: Product) => item.id === data.id
      );

      if (existingProduct) {
        existingProduct.quantity += data.quantity || 1;
      } else {
        cartData.push({ ...data, quantity: data.quantity || 1 });
      }

      localStorage.setItem('cart', JSON.stringify(cartData));
      this.cartData.next(cartData);
    }
  }

  localRemoveFromCart(productId: number): void {
    if (typeof localStorage !== 'undefined') {
      const updatedCart = JSON.parse(
        localStorage.getItem('cart') || '[]'
      ).filter((item: Product) => item.id !== productId);

      localStorage.setItem('cart', JSON.stringify(updatedCart));
      this.cartData.next(updatedCart);
    }
  }

  initializeCartFromLocalStorage(): void {
    if (typeof localStorage !== 'undefined') {
      const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
      this.cartData.next(cartData);
    }
  }
  addToCart(cartData: Cart) {
    return this.http.post('http://localhost:3000/cart', cartData).pipe(
      tap(() => {
        if (cartData.userId) {
          this.updateCartCountFromRemote(cartData.userId);
        }
      })
    );
  }

  updateCartCountFromRemote(userId: number) {
    this.http
      .get(`${this.apiUrl}/cart?userId=${userId}`)
      .subscribe((cartItems: any) => {
        this.cartData.next(cartItems as any);
      });
  }

  getCartItems() {
    if (typeof localStorage !== 'undefined') {
      const userStore = localStorage.getItem('user');
      const userData = userStore ? JSON.parse(userStore) : null;

      if (userData) {
        const userId = userData.id;
        return this.http.get<Cart[]>(`${this.apiUrl}/cart?userId=${userId}`);
      } else {
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const normalized = localCart.map((item: any) => ({
          ...item,
          product: item as Product,
        }));
        return new BehaviorSubject<Cart[]>(normalized);
      }
    } else {
      // During SSR, return empty observable
      return new BehaviorSubject<Cart[]>([]);
    }
  }

  deleteCartItem(cartId: number) {
    return this.http.delete(`${this.apiUrl}/cart/${cartId}`);
  }

  calculateCartTotals(cartItems: any[]) {
    let subtotal = 0;
    let discount = 0;

    cartItems.forEach((item) => {
      const price = item.product?.price ?? item.price;
      const qty = item.quantity || 1;

      subtotal += price * qty;

      // discount per item
      const disc = (item.product?.discount ?? item.discount ?? 0) / 100;
      discount += price * disc * qty;
    });

    const tax = subtotal * 0.1;
    const delivery = 20; // fixed delivery
    const total = subtotal + tax + delivery - discount;

    return { subtotal, tax, delivery, discount, total };
  }

  placeOrder(order: order) {
    return this.http.post(`${this.apiUrl}/orders`, order);
  }

  orderList() {
    if (typeof localStorage !== 'undefined') {
      const userStore = localStorage.getItem('user');
      const userData = userStore ? JSON.parse(userStore) : null;
      const userId = userData?.id;
      if (userId) {
        return this.http.get<order[]>(`${this.apiUrl}/orders?userId=${userId}`);
      }
    }
    return new BehaviorSubject<order[]>([]);
  }

  cancelOrder(id: number) {
    return this.http.delete(`${this.apiUrl}/orders/${id}`);
  }
}
