import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../core/models';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';
import { WishlistService } from '../../../core/services/wishlist.service';
import { TranslationService } from '../../../core/services/translation.service';
import { StarRatingComponent } from '../star-rating/star-rating.component';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { EgpPipe } from '../../pipes/egp.pipe';
import { LucideHeart, LucideSlidersHorizontal, LucidePlus } from '@lucide/angular';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    StarRatingComponent,
    TranslatePipe,
    EgpPipe,
    LucideHeart,
    LucideSlidersHorizontal,
    LucidePlus
  ],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input({ required: true }) product!: Product;

  authService = inject(AuthService);
  cartService = inject(CartService);
  wishlistService = inject(WishlistService);
  translationService = inject(TranslationService);

  getCategoryName(): string {
    const isAr = this.translationService.currentLang() === 'ar';
    const slug = this.product.categorySlug?.toLowerCase() || '';
    if (slug.includes('pizza')) return isAr ? 'بيتزا' : 'Pizza';
    if (slug.includes('donut')) return isAr ? 'دوناتس' : 'Donuts';
    if (slug.includes('combo')) return isAr ? 'كومبو' : 'Combos';
    if (slug.includes('drink')) return isAr ? 'مشروبات' : 'Drinks';
    if (typeof this.product.category === 'object' && this.product.category?.name) {
      return this.product.category.name;
    }
    return isAr ? 'مميز' : (this.product.categorySlug?.toUpperCase() || 'DELICIOUS');
  }

  getBadgeText(): string {
    if (!this.product.badgeText) return '';
    const isAr = this.translationService.currentLang() === 'ar';
    if (!isAr) return this.product.badgeText;
    const b = this.product.badgeText.toLowerCase();
    if (b.includes('bestseller') || b.includes('best seller')) return 'الأكثر مبيعاً';
    if (b.includes('chef') || b.includes('signature')) return 'توقيع الشيف';
    if (b.includes('fresh') || b.includes('hot')) return 'طازج وساخن';
    if (b.includes('stone')) return 'حطب إيطالي';
    if (b.includes('glazed')) return 'تزيين يدوي';
    if (b.includes('sweet') || b.includes('savory')) return 'سويت آند سافوري';
    return this.product.badgeText;
  }

  getDiscountBadge(): string {
    const isAr = this.translationService.currentLang() === 'ar';
    const pct = this.calculateDiscountPercentage();
    return isAr ? `وفر ${pct}%` : `SAVE ${pct}%`;
  }

  getProductName(): string {
    const isAr = this.translationService.currentLang() === 'ar';
    if (isAr && this.product.nameAr && this.product.nameAr.trim()) {
      return this.product.nameAr.trim();
    }
    return this.product.name;
  }

  getProductDescription(): string {
    const isAr = this.translationService.currentLang() === 'ar';
    if (isAr && this.product.descriptionAr && this.product.descriptionAr.trim()) {
      return this.product.descriptionAr.trim();
    }
    return this.product.shortDescription || this.product.description;
  }

  calculateDiscountPercentage(): number {
    if (!this.product.discountPrice) return 0;
    return Math.round(((this.product.price - this.product.discountPrice) / this.product.price) * 100);
  }

  hasCustomizations(): boolean {
    const hasSizes = (this.product.availableSizes?.length || 0) > 1;
    const hasToppings = (this.product.availableToppings?.length || 0) > 0;
    const hasFlavors = (this.product.availableFlavors?.length || 0) > 0;
    return hasSizes || hasToppings || hasFlavors;
  }

  onToggleWishlist(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.wishlistService.toggleWishlist(this.product);
  }

  onQuickAdd(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.cartService.addToCart({
      product: this.product,
      quantity: 1,
      selectedSize: this.product.availableSizes?.[0] || { name: 'Regular', priceAdjustment: 0 },
    });
  }
}
