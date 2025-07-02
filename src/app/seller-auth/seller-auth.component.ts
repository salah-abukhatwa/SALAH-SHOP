import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SellerService } from '../services/seller.service';
import { login, signUp } from '../auth-data.model';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seller-auth',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './seller-auth.component.html',
  styleUrl: './seller-auth.component.css',
})
export class SellerAuthComponent implements OnInit {
  constructor(private sellerService: SellerService, private router: Router) {}
  showLogin = true;
  ngOnInit(): void {
    this.sellerService.reloadSeller();
  }

  signUp(data: signUp): void {
    console.log('Sign Up', data);
    this.sellerService.userSignUp(data);
  }
  login(data: login): void {
    console.log('Login', data);
    this.sellerService.userLogin(data);
    this.sellerService.isLoginError.subscribe((isError) => {
      if (isError) {
        alert('Email or Password is incorrect');
      }
    });
  }
  openLogin(): void {
    this.showLogin = true;
  }
  openSignUp(): void {
    this.showLogin = false;
  }
}
