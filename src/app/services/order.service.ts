import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  collectionData,
  deleteDoc,
  doc,
} from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Order } from '../model/product.model';
import { from } from 'rxjs';
import { query, where } from 'firebase/firestore';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private firestore: Firestore) {}

  placeOrder(order: Order): Observable<void> {
    const orderRef = collection(this.firestore, 'orders');
    return from(addDoc(orderRef, order)).pipe(map(() => void 0));
  }

  getOrders(userId: string): Observable<Order[]> {
    const orderRef = collection(this.firestore, 'orders');
    const q = query(orderRef, where('userId', '==', userId));
    return collectionData(q, { idField: 'id' }) as Observable<Order[]>;
  }

  cancelOrder(orderId: string): Observable<void> {
    const orderDoc = doc(this.firestore, `orders/${orderId}`);
    return from(deleteDoc(orderDoc)).pipe(map(() => void 0));
  }
}
