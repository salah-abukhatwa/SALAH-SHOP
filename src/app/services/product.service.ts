import { Injectable, OnInit } from '@angular/core';
import { Product } from '../model/product.model';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  cartData = new BehaviorSubject<Product[]>([]);
  constructor(private http: HttpClient) {}

  addProduct(data: Product): Observable<Object> {
    // Logic to add a product
    console.log('Product added:', data);
    return this.http.post('http://localhost:3000/products', data);
  }

  productList(): Observable<Product[]> {
    // Logic to get the list of products
    return this.http.get<Product[]>('http://localhost:3000/products');
  }

  deleteProduct(id: number): Observable<Object> {
    // Logic to delete a product
    return this.http.delete(`http://localhost:3000/products/${id}`);
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<Product>(`http://localhost:3000/products/${id}`);
  }
  updateProduct(id: string, data: Product): Observable<Object> {
    // Logic to update a product
    return this.http.put(`http://localhost:3000/products/${id}`, data);
  }

  popularProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('http://localhost:3000/products?_limit=3');
  }
  trendyProducts(): Observable<Product[]> {
    return this.http.get<Product[]>('http://localhost:3000/products?_limit=5');
  }

  searchProducts(query: string): Observable<Product[]> {
    return this.http.get<Product[]>(
      `http://localhost:3000/products?q=${query}`
    );
  }

  localAddToCart(data: Product): void {
    let cartData = [];
    if (localStorage.getItem('cart')) {
      cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    }
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
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const updatedCart = cart.filter((item: Product) => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    this.cartData.next(updatedCart);
  }

  initializeCartFromLocalStorage(): void {
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    this.cartData.next(cartData);
  }
}
