import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { login, signUp } from '../model/auth-data.model';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-auth.component.html',
  styleUrls: ['./user-auth.component.css'],
})
export class UserAuthComponent implements OnInit {
  showLogin = true;
  authError: string = '';
  isBrowser = false;

  constructor(
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit(): void {
    this.userService.reloadUser();
  }

  signUp(data: signUp) {
    this.userService.userSignUp(data);
  }

  login(data: login) {
    this.userService.userLogin(data);
    this.userService.isLoginError.subscribe((isError) => {
      this.authError = isError ? 'Email or Password is incorrect' : '';
    });
  }

  openLogin() {
    this.showLogin = true;
  }

  openSignUp() {
    this.showLogin = false;
  }
}
