import { Component, OnInit } from '@angular/core';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { ProductService } from '../services/product.service';
import { Cart, Product } from '../model/product.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

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
  constructor(private productService: ProductService) {}

  ngOnInit() {
    let requestsDone = 0;

    const checkLoading = () => {
      requestsDone++;
      if (requestsDone === 2) {
        this.loading = false;
      }
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
    let user: any = null;

    if (typeof localStorage !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        user = JSON.parse(storedUser);
      }
    }

    if (!user) {
      // Guest user → localStorage
      const productToAdd = { ...product, quantity: 1 };
      this.productService.localAddToCart(productToAdd);
      alert('Added to cart (Guest)');
    } else {
      // Logged-in user → remote db.json
      const userId = Array.isArray(user) ? user[0].id : user.id;
      const productToAdd: Cart = {
        productId: product.id,
        userId: userId,
        quantity: 1,
      };
      console.log(productToAdd);

      this.productService.addToCart(productToAdd).subscribe(() => {
        this.productService.updateCartCountFromRemote(userId);
        alert('Added to cart (User)');
      });
    }
  }
}
