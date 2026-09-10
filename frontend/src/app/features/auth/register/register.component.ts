import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { isValidEgyptianPhone } from '../../../core/utils/phone.validator';
import { LucideArrowRight } from '@lucide/angular';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslatePipe, LucideArrowRight],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private authService = inject(AuthService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private translationService = inject(TranslationService);

  name = '';
  email = '';
  password = '';
  phone = '';
  street = '';
  phoneTouched = signal(false);
  isLoading = signal(false);

  isPhoneValid(): boolean {
    if (!this.phone.trim()) return true;
    return isValidEgyptianPhone(this.phone);
  }

  onRegister(): void {
    if (!this.name || !this.email || !this.password) return;

    if (this.phone.trim() && !isValidEgyptianPhone(this.phone)) {
      const isAr = this.translationService.currentLang() === 'ar';
      this.toastService.error(
        isAr
          ? 'يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678 أو 01001234567+).'
          : 'Please enter a valid Egyptian phone number (e.g. 01012345678 or +20 100 123 4567).'
      );
      return;
    }

    this.isLoading.set(true);
    this.authService.register({
      name: this.name,
      email: this.email,
      password: this.password,
      phone: this.phone,
      address: { street: this.street, city: 'Cairo', isDefault: true },
    }).subscribe({
      next: () => {
        this.router.navigate(['/']);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }
}
