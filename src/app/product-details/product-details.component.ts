import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../services/product.service';
import { Cart, Product } from '../model/product.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-details',
  standalone: true,
  imports: [RouterModule, CommonModule, FormsModule],
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
})
export class ProductDetailsComponent implements OnInit {
  productData: Product | null = null;
  productQuantity: number = 1;
  removeProduct: boolean = false;
  isGuestUser = true;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    // Safe access to localStorage
    if (typeof localStorage !== 'undefined') {
      this.isGuestUser = !localStorage.getItem('user');
    }

    const productId = this.route.snapshot.paramMap.get('id');

    if (productId) {
      this.productService.getProduct(productId).subscribe((data: Product) => {
        this.productData = data;
        this.loading = false;

        if (typeof localStorage !== 'undefined') {
          const cart = JSON.parse(localStorage.getItem('cart') || '[]');
          this.removeProduct = cart.some(
            (item: Product) => item.id === this.productData?.id
          );
        }
      });
    }
  }

  handleQuantity(value: string): void {
    if (this.productQuantity < 20 && value === 'plus') {
      this.productQuantity += 1;
    } else if (this.productQuantity > 1 && value === 'minus') {
      this.productQuantity -= 1;
    }
  }

  addToCart() {
    if (!this.productData) return;

    if (typeof localStorage === 'undefined' || this.isGuestUser) {
      // Guest user: use localStorage cart
      const productToAdd = {
        ...this.productData,
        quantity: this.productQuantity,
      };
      this.productService.localAddToCart(productToAdd);
      this.removeProduct = true;
    } else {
      // Logged-in user: save to remote cart
      let user: string | null = null;

      if (typeof localStorage !== 'undefined') {
        user = localStorage.getItem('user');
      }
      const userId = user && JSON.parse(user)?.id;

      if (userId) {
        const productToAdd: Cart = {
          productId: this.productData.id,
          userId: userId,
          quantity: this.productQuantity,
        };

        this.productService.addToCart(productToAdd).subscribe(() => {
          this.removeProduct = true;
        });
      }
    }
  }

  removeFromCart(): void {
    if (typeof localStorage !== 'undefined' && this.productData) {
      this.productService.localRemoveFromCart(this.productData.id);
      this.removeProduct = false;
    }
  }
}
