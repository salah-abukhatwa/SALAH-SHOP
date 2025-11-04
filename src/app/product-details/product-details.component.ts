import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../services/product.service';
import { CartService } from '../services/cart.service';
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
  productQuantity = 1;
  removeProduct = false;
  isGuestUser = true;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.isGuestUser = !localStorage.getItem('user');
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.productService.getProduct(productId).subscribe((data) => {
        this.productData = data;
        this.loading = false;
        if (this.isGuestUser) {
          const cart = JSON.parse(localStorage.getItem('cart') || '[]');
          this.removeProduct = cart.some(
            (item: any) => item.id === this.productData?.id
          );
        } else {
          const user = localStorage.getItem('user');
          const userId = user ? JSON.parse(user)?.id : null;
          if (userId) {
            this.cartService.getCart(userId).subscribe((cart) => {
              this.removeProduct = cart.some(
                (item) => item.productId === this.productData?.id
              );
            });
          }
        }
      });
    }
  }

  handleQuantity(value: string): void {
    if (value === 'plus' && this.productQuantity < 20) this.productQuantity++;
    if (value === 'minus' && this.productQuantity > 1) this.productQuantity--;
  }

  addToCart(): void {
    if (!this.productData) return;
    if (this.isGuestUser) {
      const productToAdd = {
        ...this.productData,
        quantity: this.productQuantity,
      };
      this.cartService.addToLocalCart(productToAdd);
      this.removeProduct = true;
      return;
    }
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user)?.id : null;
    if (userId) {
      const cartItem: Cart = {
        productId: this.productData.id!,
        userId: userId as string,
        quantity: this.productQuantity,
      };
      this.cartService.addToCart(cartItem).subscribe(() => {
        this.removeProduct = true;
      });
    }
  }

  removeFromCart(): void {
    if (!this.productData) return;
    if (this.isGuestUser) {
      this.cartService.removeLocalCartItem(this.productData.id!);
      this.removeProduct = false;
      return;
    }
    const user = localStorage.getItem('user');
    const userId = user ? JSON.parse(user)?.id : null;
    if (userId) {
      this.cartService.getCart(userId).subscribe((cart) => {
        const item = cart.find((c) => c.productId === this.productData?.id);
        if (item?.id) {
          this.cartService.deleteCartItem(item.id).subscribe(() => {
            this.removeProduct = false;
          });
        }
      });
    }
  }
}
