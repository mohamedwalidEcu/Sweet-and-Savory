import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CouponService } from '../../../core/services/coupon.service';
import { ToastService } from '../../../core/services/toast.service';
import { Coupon } from '../../../core/models';
import { EgpPipe } from '../../../shared/pipes/egp.pipe';
import { LucidePlus, LucideTrash2, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-admin-coupons',
  standalone: true,
  imports: [CommonModule, FormsModule, EgpPipe, LucidePlus, LucideTrash2, LucideX],
  templateUrl: './admin-coupons.component.html',
  styleUrl: './admin-coupons.component.css'
})
export class AdminCouponsComponent implements OnInit {
  private couponService = inject(CouponService);
  private toastService = inject(ToastService);

  coupons = signal<Coupon[]>([]);
  isLoading = signal(true);
  isModalOpen = signal(false);
  isSaving = signal(false);

  formData = {
    code: '',
    type: 'percentage',
    value: 15,
    minOrder: 20,
    description: '',
    expirationDate: '',
  };

  ngOnInit(): void {
    this.fetchCoupons();
  }

  fetchCoupons(): void {
    this.isLoading.set(true);
    this.couponService.getAllCoupons().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.coupons.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  openAddModal(): void {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);
    this.formData = {
      code: '',
      type: 'percentage',
      value: 15,
      minOrder: 20,
      description: '',
      expirationDate: futureDate.toISOString().split('T')[0],
    };
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  onCreateCoupon(): void {
    if (!this.formData.code || !this.formData.value || !this.formData.expirationDate) return;

    this.isSaving.set(true);
    this.couponService.createCoupon({
      code: this.formData.code.toUpperCase().trim(),
      type: this.formData.type as 'percentage' | 'fixed',
      value: Number(this.formData.value),
      minOrder: Number(this.formData.minOrder) || 0,
      description: this.formData.description,
      expirationDate: this.formData.expirationDate,
      isActive: true,
    }).subscribe({
      next: () => {
        this.toastService.success(`Created coupon ${this.formData.code}!`);
        this.closeModal();
        this.fetchCoupons();
        this.isSaving.set(false);
      },
      error: () => this.isSaving.set(false),
    });
  }

  onDelete(id: string): void {
    if (confirm('Delete this coupon code?')) {
      this.couponService.deleteCoupon(id).subscribe({
        next: () => {
          this.toastService.info('Coupon deleted');
          this.fetchCoupons();
        }
      });
    }
  }
}
