import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { signUp, login } from '../model/auth-data.model';
import { isPlatformBrowser } from '@angular/common';
import { CartService } from './cart.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  isUserLoggedIn = new BehaviorSubject<boolean>(false);
  isLoginError = new BehaviorSubject<boolean>(false);
  isBrowser = false;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    private cartService: CartService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async userSignUp(data: signUp) {
    try {
      const userCredential: UserCredential =
        await createUserWithEmailAndPassword(
          this.auth,
          data.email,
          data.password
        );
      const userId = userCredential.user.uid;
      await setDoc(doc(this.firestore, 'users', userId), {
        name: data.name,
        email: data.email,
        id: userId,
      });
      if (this.isBrowser) {
        localStorage.setItem(
          'user',
          JSON.stringify({ id: userId, email: data.email, name: data.name })
        );
      }
      this.isUserLoggedIn.next(true);
      this.syncCartAfterAuth();
      this.router.navigate(['/']);
    } catch {
      this.isLoginError.next(true);
    }
  }

  async userLogin(data: login) {
    try {
      const userCredential: UserCredential = await signInWithEmailAndPassword(
        this.auth,
        data.email,
        data.password
      );
      const userId = userCredential.user.uid;
      const docRef = doc(this.firestore, 'users', userId);
      const userDoc = await getDoc(docRef);
      if (userDoc.exists() && this.isBrowser) {
        localStorage.setItem('user', JSON.stringify(userDoc.data()));
      }
      this.isUserLoggedIn.next(true);
      this.isLoginError.next(false);
      this.syncCartAfterAuth();
      this.router.navigate(['/']);
    } catch {
      this.isLoginError.next(true);
    }
  }

  async userLogout() {
    await signOut(this.auth);
    if (this.isBrowser) {
      localStorage.removeItem('user');
    }
    this.isUserLoggedIn.next(false);
    this.router.navigate(['/login']);
  }

  reloadUser() {
    if (!this.isBrowser) return;
    const userData = localStorage.getItem('user');
    if (userData) {
      this.isUserLoggedIn.next(true);
      const userId = JSON.parse(userData)?.id;
      if (userId) {
        this.cartService.updateCart(userId);
      }
    }
  }

  private syncCartAfterAuth() {
    if (!this.isBrowser) return;
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const userStore = localStorage.getItem('user');
    const userId = userStore ? JSON.parse(userStore)?.id : null;

    if (userId && localCart.length) {
      localCart.forEach((item: any) => {
        const cartItem = {
          productId: item.id,
          userId,
          quantity: item.quantity || 1,
        };
        this.cartService.addToCart(cartItem).subscribe();
      });
      localStorage.removeItem('cart');
      this.cartService.updateCart();
    }
  }
}
