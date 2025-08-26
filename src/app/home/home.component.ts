import { Component, OnInit } from '@angular/core';
import { NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { ProductService } from '../services/product.service';
import { Cart, Product } from '../model/product.model';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NgbCarouselModule, CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
  products: Product[] = [];
  popularProducts: Product[] = [];
  trendyProducts: Product[] = [];
  constructor(private productService: ProductService) {}
  ngOnInit() {
    this.productService.popularProducts().subscribe((data) => {
      this.popularProducts = data;
    });
    this.productService.trendyProducts().subscribe((data) => {
      this.trendyProducts = data;
    });
    this.productService.productList().subscribe((data) => {
      this.products = data;
    });
  }

  addToCart(product: Product): void {
    const user = localStorage.getItem('user');

    if (!user) {
      // Guest user → localStorage
      const productToAdd = { ...product, quantity: 1 };
      this.productService.localAddToCart(productToAdd);
      alert('Added to cart (Guest)');
    } else {
      // Logged-in user → remote db.json
      const userId = JSON.parse(user).id;
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
