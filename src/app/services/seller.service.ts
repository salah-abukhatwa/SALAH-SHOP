import { Injectable } from '@angular/core';
import {
  Auth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  UserCredential,
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { signUp, login } from '../model/auth-data.model';
import { Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class SellerService {
  isSellerLoggedIn = new BehaviorSubject<boolean>(false);
  isLoginError = new BehaviorSubject<boolean>(false);
  isBrowser = false;

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  async userSignUp(data: signUp) {
    try {
      const sellerCredential: UserCredential =
        await createUserWithEmailAndPassword(
          this.auth,
          data.email,
          data.password
        );
      const sellerId = sellerCredential.user.uid;
      await setDoc(doc(this.firestore, 'seller', sellerId), {
        name: data.name,
        email: data.email,
        id: sellerId,
      });
      if (this.isBrowser)
        localStorage.setItem(
          'seller',
          JSON.stringify({ id: sellerId, email: data.email, name: data.name })
        );
      this.isSellerLoggedIn.next(true);
      this.router.navigate(['/seller-home']);
    } catch {
      this.isLoginError.next(true);
    }
  }

  async userLogin(data: login) {
    try {
      const sellerCredential: UserCredential = await signInWithEmailAndPassword(
        this.auth,
        data.email,
        data.password
      );
      const sellerId = sellerCredential.user.uid;
      const docRef = doc(this.firestore, 'seller', sellerId);
      const sellerDoc = await getDoc(docRef);
      if (sellerDoc.exists()) {
        if (this.isBrowser)
          localStorage.setItem('seller', JSON.stringify(sellerDoc.data()));
      }
      this.isSellerLoggedIn.next(true);
      this.isLoginError.next(false);
      this.router.navigate(['/seller-home']);
    } catch {
      this.isLoginError.next(true);
    }
  }

  reloadSeller() {
    if (!this.isBrowser) return;
    const sellerData = localStorage.getItem('seller');
    if (sellerData) this.isSellerLoggedIn.next(true);
  }

  async logOut() {
    await signOut(this.auth);
    if (this.isBrowser) localStorage.removeItem('seller');
    this.isSellerLoggedIn.next(false);
    this.router.navigate(['/seller-auth']);
  }
}
