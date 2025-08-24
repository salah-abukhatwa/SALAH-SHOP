import { Component, OnInit } from '@angular/core';
import { login, signUp } from '../model/auth-data.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-user-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-auth.component.html',
  styleUrl: './user-auth.component.css',
})
export class UserAuthComponent implements OnInit {
  showLogin = true;
  authError: string = '';

  constructor(private userService: UserService) {}

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
