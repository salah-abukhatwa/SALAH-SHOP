import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  addDoc,
  doc,
  docData,
  deleteDoc,
} from '@angular/fire/firestore';
import { catchError, from, map, Observable, of, throwError } from 'rxjs';
import { UpdateData, updateDoc } from 'firebase/firestore';
import { Product } from '../model/product.model';

@Injectable({ providedIn: 'root' })
export class ProductService {
  constructor(private firestore: Firestore) {}

  // ---- Products ----
  productList(): Observable<Product[]> {
    const productsRef = collection(this.firestore, 'products');
    return collectionData(productsRef, { idField: 'id' }).pipe(
      map((items) => items as Product[])
    );
  }
  getAllProducts(): Observable<Product[]> {
    return this.productList();
  }

  getProduct(id: string): Observable<Product | null> {
    if (!id) return of(null);
    const productDoc = doc(this.firestore, `products/${id}`);
    return docData(productDoc, { idField: 'id' }).pipe(
      map((p) => (p ? (p as Product) : null)),
      catchError((err) => {
        console.error('Error fetching product:', id, err);
        return of(null);
      })
    );
  }

  addProduct(product: Product): Observable<void> {
    const productWithDefaults = {
      ...product,
      isTrendy: true,
    };

    return from(
      addDoc(collection(this.firestore, 'products'), productWithDefaults)
    ).pipe(map(() => void 0));
  }

  updateProduct(productId: string, product: Product): Observable<void> {
    const productRef = doc(this.firestore, `products/${productId}`);
    const { id, ...productData } = product;

    return from(updateDoc(productRef, productData as UpdateData<Product>)).pipe(
      map(() => void 0)
    );
  }

  deleteProduct(productId: string): Observable<void> {
    return of(deleteDoc(doc(this.firestore, `products/${productId}`))).pipe(
      map(() => void 0)
    );
  }

  popularProducts(): Observable<Product[]> {
    return this.productList().pipe(
      map((products) => products.filter((p) => p.isPopular))
    );
  }

  trendyProducts(): Observable<Product[]> {
    return this.productList().pipe(
      map((products) => products.filter((p) => p.isTrendy))
    );
  }

  searchProducts(query: string): Observable<Product[]> {
    return this.productList().pipe(
      map((products) =>
        products.filter(
          (p) =>
            p.name?.toLowerCase().includes(query.toLowerCase()) ||
            p.color?.toLowerCase().includes(query.toLowerCase()) ||
            p.category?.toLowerCase().includes(query.toLowerCase())
        )
      )
    );
  }
}
