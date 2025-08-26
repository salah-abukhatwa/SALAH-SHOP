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
  styleUrl: './product-details.component.css',
})
export class ProductDetailsComponent implements OnInit {
  productData: Product | null = null;
  productQuantity: number = 1;
  removeProduct: boolean = false;
  isGuestUser = !localStorage.getItem('user');

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');

    if (productId) {
      this.productService.getProduct(productId).subscribe((data: Product) => {
        this.productData = data;

        // Check if this product already exists in local cart
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.removeProduct = cart.some(
          (item: Product) => item.id === this.productData?.id
        );
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

    if (this.isGuestUser) {
      // Guest user: use localStorage cart
      const productToAdd = {
        ...this.productData,
        quantity: this.productQuantity,
      };
      this.productService.localAddToCart(productToAdd);
      this.removeProduct = true;
    } else {
      // Logged-in user: save to remote cart
      const userStore = localStorage.getItem('user');
      const userId = userStore && JSON.parse(userStore).id;

      if (userId && this.productData) {
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
    if (this.productData) {
      this.productService.localRemoveFromCart(this.productData.id);
      this.removeProduct = false;
    }
  }
}
