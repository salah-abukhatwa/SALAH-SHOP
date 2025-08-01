import { Injectable } from '@angular/core';
import { signUp } from '../model/auth-data.model';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  isUserLoggedIn = new BehaviorSubject<boolean>(false);
  constructor(private http: HttpClient, private router: Router) {}

  userSignUp(user: signUp) {
    return this.http
      .post('http://localhost:3000/users', user, { observe: 'response' })
      .subscribe((result) => {
        console.log(result);
        if (result) {
          alert('Sign Up Successful');
          this.isUserLoggedIn.next(true);
          localStorage.setItem('user', JSON.stringify(result.body));
          this.router.navigate(['/']);
        } else {
          alert('Sign Up Failed');
        }
      });
  }
  reloadUser() {
    if (localStorage.getItem('seller')) {
      this.isUserLoggedIn.next(true);
      this.router.navigate(['/']);
    }
  }
}
