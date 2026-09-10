import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService } from '../../core/services/wishlist.service';
import { CartService } from '../../core/services/cart.service';
import { TranslationService } from '../../core/services/translation.service';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

import { LucideHeart, LucideArrowRight } from '@lucide/angular';

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, RouterLink, ProductCardComponent, TranslatePipe, LucideHeart, LucideArrowRight],
  templateUrl: './wishlist.component.html',
  styleUrl: './wishlist.component.css'
})
export class WishlistComponent {
  wishlistService = inject(WishlistService);
  cartService = inject(CartService);
  private translationService = inject(TranslationService);

  isArabic(): boolean {
    return this.translationService.isArabic();
  }
}
