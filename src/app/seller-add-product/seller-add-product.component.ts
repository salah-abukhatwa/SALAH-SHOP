import { Component, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { Product } from '../model/product.model';

@Component({
  selector: 'app-seller-add-product',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './seller-add-product.component.html',
  styleUrl: './seller-add-product.component.css',
})
export class SellerAddProductComponent {
  addProductMessage: string = '';

  constructor(private productService: ProductService) {}

  submit(data: Product) {
    console.log('Product data submitted:', data);
    this.productService.addProduct(data).subscribe((result) => {
      console.log('Product added successfully:', result);
      if (result) {
        this.addProductMessage = 'Product added successfully!';
      }
    });
    setTimeout(() => {
      this.addProductMessage = '';
    }, 3000);
  }
}
