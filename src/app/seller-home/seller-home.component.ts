import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Product } from '../model/product.model';
import { CommonModule } from '@angular/common';
import { faTrash, faEdit } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-seller-home',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterLink],
  templateUrl: './seller-home.component.html',
  styleUrl: './seller-home.component.css',
})
export class SellerHomeComponent implements OnInit {
  productList: Product[] = [];
  productMessage: string | undefined = '';
  icon = faTrash;
  iconEdit = faEdit;
  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.productList().subscribe((data) => {
      console.log('Product list:', data);
      if (data) {
        this.productList = data;
      }
    });
  }

  deleteProduct(id: number) {
    this.productService.deleteProduct(id).subscribe(() => {
      this.productList = this.productList.filter(
        (product) => product.id !== id
      );
      this.productMessage = 'Product deleted successfully';
      setTimeout(() => {
        this.productMessage = '';
      }, 3000);
    });
  }
}
