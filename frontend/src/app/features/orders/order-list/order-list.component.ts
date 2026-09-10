import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { TranslationService } from '../../../core/services/translation.service';
import { Order } from '../../../core/models';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { EgpPipe } from '../../../shared/pipes/egp.pipe';

import { LucideMapPin, LucideArrowRight } from '@lucide/angular';

@Component({
  selector: 'app-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, EgpPipe, LucideMapPin, LucideArrowRight],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent implements OnInit {
  private orderService = inject(OrderService);
  translationService = inject(TranslationService);

  orders = signal<Order[]>([]);
  isLoading = signal(true);

  isArabic(): boolean {
    return this.translationService.currentLang() === 'ar';
  }

  ngOnInit(): void {
    this.fetchOrders();
  }

  fetchOrders(): void {
    this.orderService.getMyOrders().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.orders.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  getStatusLabel(status: string): string {
    const isAr = this.isArabic();
    switch (status) {
      case 'pending': return isAr ? 'تم استلام الطلب' : 'Order Placed';
      case 'preparing': return isAr ? 'قيد الخبز والتحضير' : 'Baking in Oven';
      case 'out_for_delivery': return isAr ? 'خرج مع المندوب' : 'Out for Delivery';
      case 'delivered': return isAr ? 'تم التسليم بنجاح' : 'Delivered';
      case 'cancelled': return isAr ? 'تم الإلغاء' : 'Cancelled';
      default: return status;
    }
  }
}
