import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ToastService } from '../../../core/services/toast.service';
import { Order } from '../../../core/models';
import { EgpPipe } from '../../../shared/pipes/egp.pipe';
import { LucideSearch, LucideExternalLink } from '@lucide/angular';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EgpPipe, LucideSearch, LucideExternalLink],
  templateUrl: './admin-orders.component.html',
  styleUrl: './admin-orders.component.css'
})
export class AdminOrdersComponent implements OnInit {
  private orderService = inject(OrderService);
  private toastService = inject(ToastService);

  orders = signal<Order[]>([]);
  isLoading = signal(true);
  searchQuery = '';
  selectedStatus = 'all';

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.isLoading.set(true);
    this.orderService.getAllOrders({
      status: this.selectedStatus,
      search: this.searchQuery,
      limit: 50,
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.orders.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  setStatus(status: string): void {
    this.selectedStatus = status;
    this.fetchOrders();
  }

  onUpdateStatus(orderId: string, newStatus: string): void {
    this.orderService.updateOrderStatus(orderId, newStatus, `Kitchen updated status to ${newStatus}`).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastService.success(`Status updated to ${newStatus.toUpperCase()}! Socket.IO event dispatched to customer.`);
          this.fetchOrders();
        }
      }
    });
  }
}
