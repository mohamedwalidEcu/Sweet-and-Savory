import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { ThemeService } from '../../../core/services/theme.service';
import { TranslationService } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { EgpPipe } from '../../pipes/egp.pipe';

import {
  LucideHeart,
  LucideShoppingBag,
  LucideUser,
  LucideLogOut,
  LucideLayoutDashboard,
  LucideReceipt,
  LucideGlobe,
  LucideSun,
  LucideMoon,
  LucideMenu,
  LucideX,
  LucideChevronDown,
  LucideHome,
  LucideUtensils,
  LucidePizza,
  LucideDonut,
  LucideFlame,
  LucideTag
} from '@lucide/angular';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    EgpPipe,
    LucideHeart,
    LucideShoppingBag,
    LucideUser,
    LucideLogOut,
    LucideLayoutDashboard,
    LucideReceipt,
    LucideGlobe,
    LucideSun,
    LucideMoon,
    LucideMenu,
    LucideX,
    LucideChevronDown,
    LucideHome,
    LucideUtensils,
    LucidePizza,
    LucideDonut,
    LucideFlame,
    LucideTag
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  authService = inject(AuthService);
  cartService = inject(CartService);
  wishlistService = inject(WishlistService);
  themeService = inject(ThemeService);
  translationService = inject(TranslationService);

  isScrolled = signal(false);
  isMobileOpen = signal(false);
  isUserDropdownOpen = signal(false);

  @HostListener('window:scroll')
  onWindowScroll() {
    this.isScrolled.set(window.scrollY > 30);
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.isUserDropdownOpen.set(false);
  }

  toggleMobileMenu(): void {
    this.isMobileOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.isMobileOpen.set(false);
  }

  toggleUserDropdown(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.isUserDropdownOpen.update(v => !v);
  }

  closeUserDropdown(): void {
    this.isUserDropdownOpen.set(false);
  }

  getFirstName(): string {
    const name = this.authService.currentUser()?.name || '';
    return name.split(' ')[0] || 'Account';
  }

  onLogout(): void {
    this.closeUserDropdown();
    this.closeMobileMenu();
    this.authService.logout();
  }
}
