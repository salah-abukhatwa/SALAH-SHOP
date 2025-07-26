import { Injectable } from '@angular/core';
import { Product } from '../model/product.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
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
}
