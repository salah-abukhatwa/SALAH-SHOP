import { Component } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { Product } from '../model/product.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-seller-add-product',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './seller-add-product.component.html',
  styleUrl: './seller-add-product.component.css',
})
export class SellerAddProductComponent {
  addProductMessage = '';

  constructor(private productService: ProductService, private router: Router) {}

  submit(data: Product, form: NgForm) {
    if (!data.name || !data.price) {
      this.addProductMessage = 'Please fill all required fields';
      return;
    }
    const sellerStore = localStorage.getItem('seller');
    const sellerData = sellerStore ? JSON.parse(sellerStore) : null;

    if (!sellerData?.id) {
      this.addProductMessage =
        'You must be logged in as a seller to add products.';
      return;
    }

    data.sellerId = sellerData.id;

    data.price = Number(data.price);
    if (data.discount !== undefined) {
      data.discount = Number(data.discount);
    }

    this.productService.addProduct(data).subscribe({
      next: (result) => {
        this.addProductMessage = 'Product added successfully!';
        form.reset();

        setTimeout(() => {
          this.addProductMessage = '';
          this.router.navigate(['/seller-home']);
        }, 1000);
      },
      error: (err) => {
        console.error('Error adding product:', err);
        this.addProductMessage = 'Something went wrong. Try again!';
      },
    });
  }
}
