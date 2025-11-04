import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  deleteDoc,
  doc,
  collectionData,
  query,
  where,
} from '@angular/fire/firestore';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { Cart } from '../model/product.model';
import { getDocs, updateDoc } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  cartData = new BehaviorSubject<Cart[]>([]);

  constructor(private firestore: Firestore) {}

  addToCart(cartItem: Cart): Observable<void> {
    if (!cartItem.userId) {
      this.addToLocalCart(cartItem);
      return of(void 0);
    }

    const cartRef = collection(this.firestore, 'cart');
    const q = query(
      cartRef,
      where('userId', '==', cartItem.userId),
      where('productId', '==', cartItem.productId)
    );

    return from(getDocs(q)).pipe(
      tap(async (snapshot) => {
        if (!snapshot.empty) {
          // Product already exists → increase quantity
          const existingDoc = snapshot.docs[0];
          const existingData = existingDoc.data() as Cart;
          const newQuantity = (existingData.quantity || 1) + cartItem.quantity;
          const docRef = doc(this.firestore, `cart/${existingDoc.id}`);
          await updateDoc(docRef, { quantity: newQuantity });
        } else {
          await addDoc(cartRef, cartItem);
        }
        this.updateCart(cartItem.userId);
      }),
      map(() => void 0)
    );
  }

  getCart(userId: string): Observable<Cart[]> {
    const cartRef = collection(this.firestore, 'cart');
    const q = query(cartRef, where('userId', '==', userId));
    return collectionData(q, { idField: 'id' }) as Observable<Cart[]>;
  }

  deleteCartItem(cartId: string, userId?: string): Observable<void> {
    const cartDoc = doc(this.firestore, `cart/${cartId}`);
    return from(deleteDoc(cartDoc)).pipe(
      tap(() => {
        if (userId) this.updateCart(userId);
      }),
      map(() => void 0)
    );
  }

  updateCart(userId?: string) {
    if (!userId) {
      this.loadLocalCart();
      return;
    }
    this.getCart(userId).subscribe((cart) => this.cartData.next(cart));
  }

  addToLocalCart(product: any) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');

    const existingIndex = cart.findIndex((item: any) => item.id === product.id);

    if (existingIndex !== -1) {
      cart[existingIndex].quantity += product.quantity;
    } else {
      cart.push(product);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    this.cartData.next(cart);
  }

  loadLocalCart() {
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.cartData.next(localCart);
  }

  clearLocalCart() {
    localStorage.removeItem('cart');
    this.cartData.next([]);
  }

  removeLocalCartItem(productId: string) {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    cart = cart.filter((item: any) => item.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart));
    this.cartData.next(cart);
  }

  calculateCartTotals(cartItems: any[]) {
    let subtotal = 0;
    let discount = 0;

    cartItems.forEach((item) => {
      const price = item.product?.price ?? item.price;
      const qty = item.quantity || 1;

      subtotal += price * qty;

      const disc = (item.product?.discount ?? item.discount ?? 0) / 100;
      discount += price * disc * qty;
    });

    const tax = subtotal * 0.1;
    const delivery = 20; // fixed delivery
    const total = subtotal + tax + delivery - discount;

    return { subtotal, tax, delivery, discount, total };
  }
}
