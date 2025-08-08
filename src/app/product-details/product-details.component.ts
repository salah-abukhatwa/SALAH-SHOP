import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ProductService } from '../services/product.service';
import { Product } from '../model/product.model';
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

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    const productId = this.route.snapshot.paramMap.get('id');

    if (productId) {
      this.productService.getProduct(productId).subscribe((data: Product) => {
        this.productData = data;
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        this.removeProduct = cart.some(
          (item: Product) => item.id === this.productData?.id
        );
      });
    }
    {
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
    if (this.productData) {
      const productToAdd = {
        ...this.productData,
        quantity: this.productQuantity,
      };

      this.productService.localAddToCart(productToAdd);
      this.removeProduct = true;
    }
  }
  removeFromCart(): void {
    if (this.productData) {
      this.productService.localRemoveFromCart(this.productData.id);
      this.removeProduct = false;
    }
  }
}
