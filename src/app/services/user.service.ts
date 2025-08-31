import { Injectable } from '@angular/core';
import { login, signUp } from '../model/auth-data.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ProductService } from './product.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.apiUrl;

  isUserLoggedIn = new BehaviorSubject<boolean>(false);
  isLoginError = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router,
    private productService: ProductService
  ) {}

  userSignUp(data: signUp) {
    return this.http
      .post(`${this.apiUrl}/users`, data, { observe: 'response' })
      .subscribe((result: any) => {
        if (result) {
          alert('Sign Up Successful');
          this.isUserLoggedIn.next(true);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(result.body));
            this.syncCartAfterAuth();
          }
          this.router.navigate(['/']);
        } else {
          alert('Sign Up Failed');
        }
      });
  }

  userLogin(data: login) {
    this.http
      .get(
        `${this.apiUrl}/users?email=${data.email}&password=${data.password}`,
        {
          observe: 'response',
        }
      )
      .subscribe((result: any) => {
        if (result && result.body && result.body.length) {
          alert('Login Successful');
          this.isUserLoggedIn.next(true);
          this.isLoginError.next(false);
          if (typeof localStorage !== 'undefined') {
            localStorage.setItem('user', JSON.stringify(result.body[0]));
            this.syncCartAfterAuth();
          }
          this.router.navigate(['/']);
        } else {
          this.isLoginError.next(true);
        }
      });
  }

  reloadUser() {
    if (typeof localStorage !== 'undefined') {
      const userStore = localStorage.getItem('user');
      if (userStore) {
        this.isUserLoggedIn.next(true);
        const userId = JSON.parse(userStore)[0]?.id;
        if (userId) {
          this.productService.updateCartCountFromRemote(userId);
        }
      }
    }
  }

  private syncCartAfterAuth() {
    if (typeof localStorage === 'undefined') return;

    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const userStore = localStorage.getItem('user');
    const userId = userStore ? JSON.parse(userStore)[0]?.id : null;

    if (userId) {
      // Send local cart items to remote
      localCart.forEach((item: any) => {
        const cartItem = {
          ...item,
          productId: item.id,
          userId,
        };
        delete cartItem.id;
        this.productService.addToCart(cartItem).subscribe();
      });

      localStorage.removeItem('cart');
      this.productService.updateCartCountFromRemote(userId);
    }
  }
}
