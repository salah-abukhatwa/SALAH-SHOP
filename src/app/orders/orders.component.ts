import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { order } from '../model/product.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css',
})
export class OrdersComponent implements OnInit {
  orderItem: order[] = [];
  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.getOrderList();
  }

  getOrderList() {
    this.productService.orderList().subscribe((result) => {
      this.orderItem = result;
    });
  }

  cancelOrder(id: any) {
    this.productService.cancelOrder(id).subscribe((result) => {
      if (result) {
        this.getOrderList();
      }
    });
  }
}
