import { Component, NgModule } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
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

  submit(data: Product, form: NgForm) {
    // Convert discount and price to numbers (in case user enters strings)
    data.price = Number(data.price);
    if (data.discount !== undefined) {
      data.discount = Number(data.discount);
    }

    console.log('Product data submitted:', data);

    this.productService.addProduct(data).subscribe((result) => {
      console.log('Product added successfully:', result);
      if (result) {
        this.addProductMessage = 'Product added successfully!';
        form.reset();

        setTimeout(() => {
          this.addProductMessage = '';
        }, 3000);
      }
    });
  }
}
