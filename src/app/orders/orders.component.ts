import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { Order } from '../model/product.model';
import { CommonModule } from '@angular/common';
import { OrderService } from '../services/order.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css'],
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];

  userId: string | null = null;

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    const userStore = localStorage.getItem('user');
    this.userId = userStore ? JSON.parse(userStore).id : null;
    this.getOrderList();
  }

  getOrderList(): void {
    if (!this.userId) return;
    this.orderService.getOrders(this.userId).subscribe((result) => {
      this.orders = result;
    });
  }

  cancelOrder(orderId: string | undefined): void {
    if (!orderId || !this.userId) return;

    this.orderService.cancelOrder(orderId).subscribe({
      next: () => {
        this.getOrderList(); // refresh after deletion
      },
      error: (err) => {
        console.error('Failed to cancel order:', err);
        alert('Unable to cancel order. Please try again or check permissions.');
      },
    });
  }
}
