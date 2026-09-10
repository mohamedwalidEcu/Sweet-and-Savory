import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CouponService } from '../../core/services/coupon.service';
import { ToastService } from '../../core/services/toast.service';
import { TranslationService } from '../../core/services/translation.service';
import { Coupon } from '../../core/models';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { EgpPipe } from '../../shared/pipes/egp.pipe';
import { LucideCopy, LucideFlame } from '@lucide/angular';

@Component({
  selector: 'app-offers',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslatePipe, EgpPipe, LucideCopy, LucideFlame],
  templateUrl: './offers.component.html',
  styleUrl: './offers.component.css'
})
export class OffersComponent implements OnInit {
  private couponService = inject(CouponService);
  private toastService = inject(ToastService);
  private translationService = inject(TranslationService);

  coupons = signal<any[]>([]);

  isArabic(): boolean {
    return this.translationService.isArabic();
  }

  ngOnInit(): void {
    this.couponService.getPublicOffers().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.coupons.set(res.data);
        }
      }
    });
  }

  copyCode(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.toastService.success(this.isArabic() ? `تم نسخ الكوبون: ${code}! استخدمه عند الدفع.` : `Copied code: ${code}! Apply it at checkout.`);
    });
  }
}
