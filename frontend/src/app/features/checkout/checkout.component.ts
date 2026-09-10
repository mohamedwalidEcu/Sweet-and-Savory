import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { OrderService } from '../../core/services/order.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { EgpPipe } from '../../shared/pipes/egp.pipe';
import { isValidEgyptianPhone } from '../../core/utils/phone.validator';

import { LucideCreditCard, LucideBanknote, LucideCpu, LucideArrowRight, LucideMapPin, LucidePhone, LucideShieldCheck, LucideCheckCircle2 } from '@lucide/angular';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TranslatePipe,
    EgpPipe,
    LucideCreditCard,
    LucideBanknote,
    LucideCpu,
    LucideArrowRight,
    LucideMapPin,
    LucidePhone,
    LucideShieldCheck,
    LucideCheckCircle2
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  cartService = inject(CartService);
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  translationService = inject(TranslationService);

  isArabic(): boolean {
    return this.translationService.currentLang() === 'ar';
  }

  shippingAddress = {
    fullName: '',
    phone: '',
    street: '',
    city: 'Cairo',
    deliveryNotes: '',
  };

  phoneTouched = signal(false);
  hasSubmitted = signal(false);

  paymentMethod: 'simulated_card' | 'cash_on_delivery' = 'simulated_card';

  cardDetails = {
    number: '4242 •••• •••• 4242',
    expiry: '12/28',
    cvv: '888',
  };

  isPlacingOrder = signal(false);

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.shippingAddress.fullName = user.name || '';
      this.shippingAddress.phone = user.phone || '';
      if (user.address) {
        this.shippingAddress.street = user.address.street || '';
        this.shippingAddress.city = user.address.city || 'Cairo';
      }
    }
  }

  isPhoneValid(): boolean {
    return isValidEgyptianPhone(this.shippingAddress.phone);
  }

  isFormValid(): boolean {
    return !!(
      this.shippingAddress.fullName.trim() &&
      this.shippingAddress.phone.trim() &&
      this.isPhoneValid() &&
      this.shippingAddress.street.trim() &&
      this.shippingAddress.city.trim()
    );
  }

  onSubmitOrder(): void {
    this.hasSubmitted.set(true);

    if (!this.shippingAddress.fullName.trim() || !this.shippingAddress.street.trim() || !this.shippingAddress.city.trim()) {
      const msg = this.isArabic()
        ? 'يرجى استكمال جميع بيانات التوصيل المطلوبة.'
        : 'Please complete all required delivery fields.';
      this.toastService.error(msg);
      return;
    }

    if (!this.isPhoneValid()) {
      const msg = this.isArabic()
        ? 'يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678 أو 01001234567+).'
        : 'Please enter a valid Egyptian phone number (e.g. 01012345678 or +20 100 123 4567).';
      this.toastService.error(msg);
      return;
    }

    this.isPlacingOrder.set(true);

    const orderPayload = {
      shippingAddress: this.shippingAddress,
      paymentMethod: this.paymentMethod,
      couponCode: this.cartService.appliedCoupon()?.code || undefined,
    };

    this.orderService.createOrder(orderPayload).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.toastService.success(`Order #${res.data.orderNumber} placed successfully! 🍕`);
          this.cartService.clearCart();
          this.router.navigate(['/orders', res.data._id]);
        }
        this.isPlacingOrder.set(false);
      },
      error: () => this.isPlacingOrder.set(false),
    });
  }
}
