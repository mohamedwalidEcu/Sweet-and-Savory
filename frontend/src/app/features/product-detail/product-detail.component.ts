import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { TranslationService } from '../../core/services/translation.service';
import { Product, Review, SizeOption, CustomizationOption } from '../../core/models';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';
import { EgpPipe } from '../../shared/pipes/egp.pipe';

import {
  LucideHeart,
  LucideClock,
  LucideShoppingBag,
  LucideMinus,
  LucidePlus,
  LucideCheckCircle2,
  LucideSend,
  LucideChevronRight,
  LucideAlertCircle
} from '@lucide/angular';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    StarRatingComponent,
    TranslatePipe,
    EgpPipe,
    LucideHeart,
    LucideClock,
    LucideShoppingBag,
    LucideMinus,
    LucidePlus,
    LucideCheckCircle2,
    LucideSend,
    LucideChevronRight,
    LucideAlertCircle
  ],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.css'
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private productService = inject(ProductService);
  private cartService = inject(CartService);
  wishlistService = inject(WishlistService);
  authService = inject(AuthService);
  private toastService = inject(ToastService);
  translationService = inject(TranslationService);

  product = signal<Product | null>(null);
  reviews = signal<Review[]>([]);
  isLoading = signal<boolean>(true);
  selectedImage = signal<string>('');

  isArabic(): boolean {
    return this.translationService.currentLang() === 'ar';
  }

  getCategoryName(): string {
    const p = this.product();
    if (!p) return '';
    const isAr = this.isArabic();
    const slug = p.categorySlug?.toLowerCase() || '';
    if (slug.includes('pizza')) return isAr ? 'بيتزا' : 'Pizza';
    if (slug.includes('donut')) return isAr ? 'دوناتس' : 'Donuts';
    if (slug.includes('combo')) return isAr ? 'كومبو' : 'Combos';
    if (slug.includes('drink')) return isAr ? 'مشروبات' : 'Drinks';
    return isAr ? 'قائمة الطعام' : (p.categorySlug?.toUpperCase() || 'MENU');
  }

  getBadgeText(): string {
    const p = this.product();
    if (!p || !p.badgeText) return '';
    const isAr = this.isArabic();
    if (!isAr) return p.badgeText;
    const b = p.badgeText.toLowerCase();
    if (b.includes('bestseller') || b.includes('best seller')) return 'الأكثر مبيعاً';
    if (b.includes('chef') || b.includes('signature')) return 'توقيع الشيف';
    if (b.includes('fresh') || b.includes('hot')) return 'طازج وساخن';
    if (b.includes('stone')) return 'حطب إيطالي';
    if (b.includes('glazed')) return 'تزيين يدوي';
    if (b.includes('sweet') || b.includes('savory')) return 'سويت آند سافوري';
    return p.badgeText;
  }

  // Customizations
  selectedSize = signal<SizeOption>({ name: 'Regular', priceAdjustment: 0 });
  selectedToppings = signal<CustomizationOption[]>([]);
  selectedFlavors = signal<CustomizationOption[]>([]);
  specialInstructions = '';
  quantity = signal<number>(1);

  // Review Form
  newReviewRating = signal<number>(5);
  hoverRating = signal<number>(0);
  newReviewComment = '';
  isSubmittingReview = signal<boolean>(false);

  getProductName(): string {
    const prod = this.product();
    if (this.isArabic() && prod?.nameAr && prod.nameAr.trim()) {
      return prod.nameAr.trim();
    }
    return prod?.name || '';
  }

  getProductDescription(): string {
    const prod = this.product();
    if (this.isArabic() && prod?.descriptionAr && prod.descriptionAr.trim()) {
      return prod.descriptionAr.trim();
    }
    return prod?.description || '';
  }

  setRating(star: number): void {
    this.newReviewRating.set(star);
  }

  scrollToReviews(event?: Event): void {
    if (event) event.preventDefault();
    const el = document.getElementById('customer-reviews');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  calculatedUnitPrice = computed(() => {
    const p = this.product();
    if (!p) return 0;
    const base = p.discountPrice !== null && p.discountPrice !== undefined ? p.discountPrice : p.price;
    const sizeAdj = this.selectedSize().priceAdjustment || 0;
    const toppingsTotal = this.selectedToppings().reduce((s, t) => s + (t.price || 0), 0);
    const flavorsTotal = this.selectedFlavors().reduce((s, f) => s + (f.price || 0), 0);
    return Math.round((base + sizeAdj + toppingsTotal + flavorsTotal) * 100) / 100;
  });

  calculatedTotalPrice = computed(() => {
    return Math.round((this.calculatedUnitPrice() * this.quantity()) * 100) / 100;
  });

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const slug = params['slug'];
      if (slug) {
        this.fetchProductDetails(slug);
      }
    });
  }

  fetchProductDetails(slug: string): void {
    this.isLoading.set(true);
    this.productService.getProduct(slug).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          const prod = res.data;
          this.product.set(prod);
          this.selectedImage.set(prod.images[0]);

          // Set default size
          if (prod.availableSizes && prod.availableSizes.length > 0) {
            const defaultSize = prod.availableSizes.find(s => s.isDefault) || prod.availableSizes[0];
            this.selectedSize.set(defaultSize);
          }

          // Fetch reviews
          this.fetchReviews(prod._id);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  fetchReviews(productId: string): void {
    this.productService.getProductReviews(productId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.reviews.set(res.data);
        }
      }
    });
  }

  isToppingSelected(name: string): boolean {
    return this.selectedToppings().some(t => t.name === name);
  }

  toggleTopping(topping: CustomizationOption): void {
    const current = [...this.selectedToppings()];
    const index = current.findIndex(t => t.name === topping.name);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(topping);
    }
    this.selectedToppings.set(current);
  }

  isFlavorSelected(name: string): boolean {
    return this.selectedFlavors().some(f => f.name === name);
  }

  toggleFlavor(flavor: CustomizationOption): void {
    const current = [...this.selectedFlavors()];
    const index = current.findIndex(f => f.name === flavor.name);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(flavor);
    }
    this.selectedFlavors.set(current);
  }

  increaseQty(): void {
    const prod = this.product();
    if (prod && this.quantity() < prod.stock) {
      this.quantity.update(q => q + 1);
    }
  }

  decreaseQty(): void {
    if (this.quantity() > 1) {
      this.quantity.update(q => q - 1);
    }
  }

  onAddToCart(): void {
    const prod = this.product();
    if (!prod) return;

    this.cartService.addToCart({
      product: prod,
      quantity: this.quantity(),
      selectedSize: this.selectedSize(),
      selectedToppings: this.selectedToppings(),
      selectedFlavors: this.selectedFlavors(),
      specialInstructions: this.specialInstructions,
    });
  }

  onSubmitReview(): void {
    const prod = this.product();
    if (!prod) return;

    this.isSubmittingReview.set(true);
    this.productService.addReview(prod._id, {
      rating: this.newReviewRating(),
      comment: this.newReviewComment.trim(),
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          // Update or prepend review
          this.reviews.update(revs => {
            const idx = revs.findIndex(r => r._id === res.data._id);
            if (idx > -1) {
              const copy = [...revs];
              copy[idx] = res.data;
              return copy;
            }
            return [res.data, ...revs];
          });

          // Refresh reviews and updated product stats
          this.fetchReviews(prod._id);
          this.productService.getProduct(prod._id).subscribe({
            next: (pRes) => {
              if (pRes.success && pRes.data) {
                this.product.set(pRes.data);
              }
            }
          });

          const successMsg = this.isArabic()
            ? 'شكراً لك! تم تسجيل تقييمك بنجاح.'
            : 'Thank you! Your rating and review have been posted.';
          this.toastService.success(successMsg);
          this.newReviewComment = '';
        }
        this.isSubmittingReview.set(false);
      },
      error: (err) => {
        this.isSubmittingReview.set(false);
        const errMsg = err?.error?.message || (this.isArabic() ? 'حدث خطأ أثناء إرسال التقييم' : 'Failed to submit review');
        this.toastService.error(errMsg);
      },
    });
  }
}
