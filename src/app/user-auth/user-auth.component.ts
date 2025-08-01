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
  constructor(private userServices: UserService) {}
  ngOnInit(): void {
    this.userServices.reloadUser();
  }

  signUp(data: signUp) {
    this.userServices.userSignUp(data);
  }

  login(data: login) {}

  openLogin() {
    this.showLogin = true;
  }

  openSignUp() {
    this.showLogin = false;
  }
}
