import { Component, OnInit } from '@angular/core';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { ProductService } from '../services/product.service';
import { Cart, Product } from '../model/product.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CartService } from '../services/cart.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgbCarouselModule, CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  popularProducts: Product[] = [];
  trendyProducts: Product[] = [];
  loading = true;

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit() {
    let requestsDone = 0;
    const checkLoading = () => {
      requestsDone++;
      if (requestsDone === 2) this.loading = false;
    };

    this.productService.popularProducts().subscribe((data) => {
      this.popularProducts = data;
      checkLoading();
    });

    this.productService.trendyProducts().subscribe((data) => {
      this.trendyProducts = data;
      checkLoading();
    });

    this.productService.productList().subscribe((data) => {
      this.products = data;
    });
  }

  addToCart(product: Product): void {
    if (!product.id) return;

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      const productToAdd = {
        ...product,
        quantity: 1,
      };
      this.cartService.addToLocalCart(productToAdd);
      alert('Added to cart (Guest)');
    } else {
      const userData = JSON.parse(storedUser);
      const userId = Array.isArray(userData) ? userData[0].id : userData.id;
      const cartItem: Cart = {
        productId: product.id,
        userId,
        quantity: 1,
      };
      this.cartService.addToCart(cartItem).subscribe(() => {
        alert('Added to cart (User)');
      });
    }
  }

  removeFromCart(product: Product): void {
    if (!product.id) return;

    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      this.cartService.removeLocalCartItem(product.id);
      alert('Removed from cart (Guest)');
    } else {
      const userData = JSON.parse(storedUser);
      const userId = Array.isArray(userData) ? userData[0].id : userData.id;
      this.cartService.getCart(userId).subscribe((cart) => {
        const item = cart.find((c) => c.productId === product.id);
        if (item?.id) {
          this.cartService.deleteCartItem(item.id).subscribe(() => {
            this.cartService.updateCart(userId);
            alert('Removed from cart (User)');
          });
        }
      });
    }
  }
}
