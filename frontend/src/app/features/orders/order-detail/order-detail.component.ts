import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { OrderService } from '../../../core/services/order.service';
import { SocketService } from '../../../core/services/socket.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslationService } from '../../../core/services/translation.service';
import { Order } from '../../../core/models';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { EgpPipe } from '../../../shared/pipes/egp.pipe';

import {
  LucideArrowLeft,
  LucidePrinter,
  LucideClock,
  LucideReceipt,
  LucideFlame,
  LucideTruck,
  LucideCheckCircle2
} from '@lucide/angular';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    TranslatePipe,
    EgpPipe,
    LucideArrowLeft,
    LucidePrinter,
    LucideClock,
    LucideReceipt,
    LucideFlame,
    LucideTruck,
    LucideCheckCircle2
  ],
  templateUrl: './order-detail.component.html',
  styleUrl: './order-detail.component.css'
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private socketService = inject(SocketService);
  private toastService = inject(ToastService);
  translationService = inject(TranslationService);

  order = signal<Order | null>(null);
  isLoading = signal(true);
  private socketSub: Subscription | null = null;

  isArabic(): boolean {
    return this.translationService.currentLang() === 'ar';
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.fetchOrder(id);
      }
    });
  }

  fetchOrder(id: string): void {
    this.isLoading.set(true);
    this.orderService.getOrderById(id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.order.set(res.data);
          this.initSocketTracking(res.data._id);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  initSocketTracking(orderId: string): void {
    this.socketService.joinOrderRoom(orderId);

    // Listen to real-time status updates for this specific order
    this.socketSub = this.socketService.onSpecificOrderUpdated(orderId).subscribe((data) => {
      if (this.order()) {
        const updated = { ...this.order()! };
        updated.orderStatus = data.status;
        if (!updated.statusHistory) updated.statusHistory = [];
        updated.statusHistory.push({
          status: data.status,
          note: data.note,
          timestamp: data.timestamp || new Date(),
        });
        this.order.set(updated);
        this.toastService.success(`Live update: Order is now ${this.formatStatus(data.status)}!`);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.socketSub) {
      this.socketSub.unsubscribe();
    }
  }

  formatStatus(status: string): string {
    const isAr = this.isArabic();
    switch (status) {
      case 'pending': return isAr ? 'تم استلام الطلب' : 'ORDER PLACED';
      case 'preparing': return isAr ? 'قيد التحضير والخبز' : 'IN KITCHEN';
      case 'out_for_delivery': return isAr ? 'خرج مع المندوب للتوصيل' : 'OUT FOR DELIVERY';
      case 'delivered': return isAr ? 'تم التوصيل بنجاح' : 'DELIVERED';
      case 'cancelled': return isAr ? 'ملغي' : 'CANCELLED';
      default: return status.replace(/_/g, ' ').toUpperCase();
    }
  }

  isStepCompleted(step: string): boolean {
    const status = this.order()?.orderStatus;
    const orderRanks: Record<string, number> = {
      'pending': 1,
      'preparing': 2,
      'out_for_delivery': 3,
      'delivered': 4,
    };
    return (orderRanks[status || 'pending'] || 0) >= (orderRanks[step] || 0);
  }

  isLineFilled(step: string): boolean {
    return this.isStepCompleted(step);
  }

  printInvoice(): void {
    window.print();
  }
}
