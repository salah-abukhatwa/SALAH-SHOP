import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { login, signUp } from '../model/auth-data.model';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SellerService {
  private apiUrl = environment.apiUrl;

  isSellerLoggedIn = new BehaviorSubject<boolean>(false);
  isLoginError = new BehaviorSubject<boolean>(false);
  constructor(private http: HttpClient, private router: Router) {}

  userSignUp(data: signUp) {
    return this.http
      .post(`${this.apiUrl}/seller`, data, { observe: 'response' })
      .subscribe((result) => {
        console.log(result);
        if (result) {
          alert('Sign Up Successful');
          this.isSellerLoggedIn.next(true);
          localStorage.setItem('seller', JSON.stringify(result.body));

          this.router.navigate(['/seller-home']);
        } else {
          alert('Sign Up Failed');
        }
      });
  }
  userLogin(data: login) {
    this.http
      .get(
        `${this.apiUrl}/seller?email=${data.email}&password=${data.password}`,
        { observe: 'response' }
      )
      .subscribe((result: any) => {
        console.log(result);
        if (result && result.body && result.body.length) {
          alert('Login Successful');
          this.isSellerLoggedIn.next(true);
          this.isLoginError.next(false);
          localStorage.setItem('seller', JSON.stringify(result.body[0]));
          this.router.navigate(['/seller-home']);
        } else {
          this.isLoginError.next(true);
        }
      });
  }

  reloadSeller() {
    if (localStorage.getItem('seller')) {
      this.isSellerLoggedIn.next(true);
      this.router.navigate(['/seller-home']);
    }
  }
}
