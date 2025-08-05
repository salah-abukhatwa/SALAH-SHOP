import { Injectable } from '@angular/core';
import { login, signUp } from '../model/auth-data.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  isUserLoggedIn = new BehaviorSubject<boolean>(false);
  isLoginError = new BehaviorSubject<boolean>(false);
  constructor(private http: HttpClient, private router: Router) {}

  userSignUp(data: signUp) {
    return this.http
      .post('http://localhost:3000/users', data, { observe: 'response' })
      .subscribe((result) => {
        console.log(result);
        if (result) {
          alert('Sign Up Successful');
          this.isUserLoggedIn.next(true);
          localStorage.setItem('user', JSON.stringify([result.body]));

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
        console.log(result);
        if (result && result.body && result.body.length) {
          alert('Login Successful');
          this.isUserLoggedIn.next(true);
          this.isLoginError.next(false);
          localStorage.setItem('user', JSON.stringify(result.body));
          this.router.navigate(['/']);
        } else {
          this.isLoginError.next(true);
        }
      });
  }

  reloadUser() {
    if (localStorage.getItem('user')) {
      this.isUserLoggedIn.next(true);
      this.router.navigate(['/']);
    }
  }
}
