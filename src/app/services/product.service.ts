import { Injectable } from '@angular/core';
import { Cart, order, Product } from '../model/product.model';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  cartData = new BehaviorSubject<Cart[]>([]);

  constructor(private http: HttpClient) {}

  addProduct(data: Product): Observable<Object> {
    return this.http.post('http://localhost:3000/products', data);
  }

  productList(): Observable<Product[]> {
    return this.http.get<Product[]>('http://localhost:3000/products');
  }

  deleteProduct(id: number): Observable<Object> {
    return this.http.delete(`http://localhost:3000/products/${id}`);
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`http://localhost:3000/products/${id}`);
  }

  updateProduct(id: string, data: Product): Observable<Object> {
    return this.http.put(`http://localhost:3000/products/${id}`, data);
  }

  popularProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('http://localhost:3000/products?_limit=3');
  }

  trendyProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('http://localhost:3000/products?_limit=8');
  }

  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(
      `http://localhost:3000/products?q=${query}`
    );
  }

  // -------------------- CART METHODS --------------------
  localAddToCart(data: Product): void {
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

  localRemoveFromCart(productId: number): void {
    const updatedCart = JSON.parse(localStorage.getItem('cart') || '[]').filter(
      (item: Product) => item.id !== productId
    );

    localStorage.setItem('cart', JSON.stringify(updatedCart));
    this.cartData.next(updatedCart);
  }

  initializeCartFromLocalStorage(): void {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    this.cartData.next(cartData);
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
      .get(`http://localhost:3000/cart?userId=${userId}`)
      .subscribe((cartItems: any) => {
        this.cartData.next(cartItems as any);
      });
  }

  getCartItems() {
    const userStore = localStorage.getItem('user');
    const userData = userStore ? JSON.parse(userStore) : null;

    if (userData) {
      const userId = userData.id;
      return this.http.get<Cart[]>(
        `http://localhost:3000/cart?userId=${userId}`
      );
    } else {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const normalized = localCart.map((item: any) => ({
        ...item,
        product: item as Product, // 👈 wrap product
      }));
      return new BehaviorSubject<Cart[]>(normalized);
    }
  }

  deleteCartItem(cartId: number) {
    return this.http.delete(`http://localhost:3000/cart/${cartId}`);
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
    return this.http.post('http://localhost:3000/orders', order);
  }

  orderList() {
    const userStore = localStorage.getItem('user');
    const userData = userStore ? JSON.parse(userStore) : null;

    const userId = userData.id;
    return this.http.get<order[]>(
      `http://localhost:3000/orders?userId=${userId}`
    );
  }

  cancelOrder(id: number) {
    return this.http.delete(`http://localhost:3000/orders/${id}`);
  }
}
