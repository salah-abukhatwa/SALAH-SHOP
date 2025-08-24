import { Injectable } from '@angular/core';
import { login, signUp } from '../model/auth-data.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ProductService } from './product.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  isUserLoggedIn = new BehaviorSubject<boolean>(false);
  isLoginError = new BehaviorSubject<boolean>(false);

  constructor(
    private http: HttpClient,
    private router: Router,
    private productService: ProductService
  ) {}

  userSignUp(data: signUp) {
    return this.http
      .post('http://localhost:3000/users', data, { observe: 'response' })
      .subscribe((result: any) => {
        if (result) {
          alert('Sign Up Successful');
          this.isUserLoggedIn.next(true);
          localStorage.setItem('user', JSON.stringify([result.body]));
          this.syncCartAfterAuth();
          this.router.navigate(['/']);
        } else {
          alert('Sign Up Failed');
        }
      });
  }

  userLogin(data: login) {
    this.http
      .get(
        `http://localhost:3000/users?email=${data.email}&password=${data.password}`,
        { observe: 'response' }
      )
      .subscribe((result: any) => {
        if (result && result.body && result.body.length) {
          alert('Login Successful');
          this.isUserLoggedIn.next(true);
          this.isLoginError.next(false);
          localStorage.setItem('user', JSON.stringify(result.body));
          this.syncCartAfterAuth();
          this.router.navigate(['/']);
        } else {
          this.isLoginError.next(true);
        }
      });
  }

  reloadUser() {
    if (localStorage.getItem('user')) {
      this.isUserLoggedIn.next(true);

      const userStore = localStorage.getItem('user');
      const userId = userStore && JSON.parse(userStore)[0]?.id;

      if (userId) {
        this.productService.updateCartCountFromRemote(userId);
      }
    }
  }

  private syncCartAfterAuth() {
    const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const userId = JSON.parse(localStorage.getItem('user') || '[]')[0]?.id;

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
