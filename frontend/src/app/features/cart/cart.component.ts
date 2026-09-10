import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { CouponService } from '../../core/services/coupon.service';
import { ToastService } from '../../core/services/toast.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { EgpPipe } from '../../shared/pipes/egp.pipe';

import {
  LucideTrash2,
  LucideMinus,
  LucidePlus,
  LucideShoppingBag,
  LucideArrowRight,
  LucideArrowLeft,
  LucideTag,
  LucideX,
  LucideShieldCheck
} from '@lucide/angular';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TranslatePipe,
    EgpPipe,
    LucideTrash2,
    LucideMinus,
    LucidePlus,
    LucideShoppingBag,
    LucideArrowRight,
    LucideArrowLeft,
    LucideTag,
    LucideX,
    LucideShieldCheck
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent {
  cartService = inject(CartService);
  private couponService = inject(CouponService);
  private toastService = inject(ToastService);
  translationService = inject(TranslationService);

  couponCodeInput = '';
  isValidatingCoupon = signal(false);

  isArabic(): boolean {
    return this.translationService.currentLang() === 'ar';
  }

  applyCoupon(): void {
    if (!this.couponCodeInput.trim()) return;

    this.isValidatingCoupon.set(true);
    this.couponService.validateCoupon(this.couponCodeInput.trim(), this.cartService.subtotal()).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.cartService.setCoupon({
            code: res.data.code,
            discountAmount: res.data.discountAmount,
          });
          this.toastService.success(this.isArabic() ? `تم تطبيق الكوبون ${res.data.code}: تم توفير ${res.data.discountAmount} ج.م!` : `Applied coupon ${res.data.code}: Saved ${res.data.discountAmount} EGP!`);
        }
        this.isValidatingCoupon.set(false);
      },
      error: () => this.isValidatingCoupon.set(false),
    });
  }

  removeCoupon(): void {
    this.cartService.setCoupon(null);
    this.couponCodeInput = '';
    this.toastService.info(this.isArabic() ? 'تم إزالة الكوبون' : 'Coupon removed');
  }
}
