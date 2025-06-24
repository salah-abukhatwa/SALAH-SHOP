import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SellerService } from '../services/seller.service';
import { signUp } from '../auth-data.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seller-auth',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './seller-auth.component.html',
  styleUrl: './seller-auth.component.css',
})
export class SellerAuthComponent {
  constructor(private sellerService: SellerService, private router: Router) {}

  signUp(data: signUp): void {
    console.log('Sign Up', data);
    this.sellerService.userSignUp(data).subscribe((result) => {
      if (result) {
        this.router.navigate(['/seller-dashboard']);
      }
    });
  }
}
