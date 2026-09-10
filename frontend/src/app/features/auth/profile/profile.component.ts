import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { TranslationService } from '../../../core/services/translation.service';
import { isValidEgyptianPhone } from '../../../core/utils/phone.validator';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  private toastService = inject(ToastService);
  translationService = inject(TranslationService);

  name = '';
  email = '';
  phone = '';
  street = '';
  city = '';

  phoneTouched = signal(false);

  currentPassword = '';
  newPassword = '';

  isSavingProfile = signal(false);
  isChangingPass = signal(false);

  isArabic(): boolean {
    return this.translationService.currentLang() === 'ar';
  }

  isPhoneValid(): boolean {
    if (!this.phone.trim()) return true;
    return isValidEgyptianPhone(this.phone);
  }

  ngOnInit(): void {
    const user = this.authService.currentUser();
    if (user) {
      this.name = user.name || '';
      this.email = user.email || '';
      this.phone = user.phone || '';
      if (user.address) {
        this.street = user.address.street || '';
        this.city = user.address.city || '';
      }
    }
  }

  onUpdateProfile(): void {
    if (this.phone.trim() && !this.isPhoneValid()) {
      const msg = this.isArabic()
        ? 'يرجى إدخال رقم هاتف مصري صحيح (مثال: 01012345678 أو 01001234567+).'
        : 'Please enter a valid Egyptian phone number (e.g. 01012345678 or +20 100 123 4567).';
      this.toastService.error(msg);
      return;
    }

    this.isSavingProfile.set(true);
    this.authService.updateProfile({
      name: this.name,
      email: this.email,
      phone: this.phone,
      address: {
        street: this.street,
        city: this.city,
      }
    }).subscribe({
      next: () => {
        this.isSavingProfile.set(false);
        this.toastService.success('Profile updated successfully!');
      },
      error: () => this.isSavingProfile.set(false),
    });
  }

  onChangePassword(): void {
    if (!this.currentPassword || !this.newPassword) return;

    this.isChangingPass.set(true);
    this.authService.updateProfile({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
    }).subscribe({
      next: () => {
        this.currentPassword = '';
        this.newPassword = '';
        this.isChangingPass.set(false);
        this.toastService.success('Password changed successfully!');
      },
      error: () => this.isChangingPass.set(false),
    });
  }
}
