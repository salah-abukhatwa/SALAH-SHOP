import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ProductService } from '../services/product.service';
import { FormsModule } from '@angular/forms';
import { Product } from '../model/product.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seller-update-product',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './seller-update-product.component.html',
  styleUrl: './seller-update-product.component.css',
})
export class SellerUpdateProductComponent implements OnInit {
  product: Product | null = null;
  productMessage: string = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.productService.getProduct(productId).subscribe((product) => {
        this.product = product;
        console.log('Product details:', product);
      });
    }
  }

  submit(formValue: any): void {
    if (this.product) {
      const updatedProduct: Product = {
        ...this.product,
        ...formValue,
        price: Number(formValue.price ?? this.product.price), // ensure number
        discount:
          formValue.discount !== undefined
            ? Number(formValue.discount)
            : this.product.discount,
      };

      this.productService
        .updateProduct(this.product.id.toString(), updatedProduct)
        .subscribe((response) => {
          console.log('Product updated successfully:', response);
          this.productMessage = 'Product updated successfully!';
          setTimeout(
            () => (
              (this.productMessage = ''), this.router.navigate(['seller-home'])
            ),
            2000
          );
        });
    } else {
      console.error('No product found to update.');
      this.productMessage = 'Error updating product.';
    }
  }
}
