import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../core/services/product.service';
import { ToastService } from '../../core/services/toast.service';
import { TranslationService } from '../../core/services/translation.service';
import { Product } from '../../core/models';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { StarRatingComponent } from '../../shared/components/star-rating/star-rating.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

import {
  LucideArrowRight,
  LucideSparkles,
  LucideCopy,
  LucideCheckCircle2,
  LucideUtensils,
  LucidePizza,
  LucideDonut,
  LucideFlame,
  LucideCupSoda,
  LucideLayoutGrid
} from '@lucide/angular';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ProductCardComponent,
    StarRatingComponent,
    TranslatePipe,
    LucideArrowRight,
    LucideSparkles,
    LucideCopy,
    LucideCheckCircle2,
    LucideUtensils,
    LucidePizza,
    LucideDonut,
    LucideFlame,
    LucideCupSoda,
    LucideLayoutGrid
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  private productService = inject(ProductService);
  private toastService = inject(ToastService);
  translationService = inject(TranslationService);

  products = signal<Product[]>([]);
  filteredProducts = signal<Product[]>([]);
  selectedCategory = signal<string>('all');
  isLoading = signal<boolean>(true);

  isArabic(): boolean {
    return this.translationService.currentLang() === 'ar';
  }

  ngOnInit(): void {
    this.fetchFeaturedProducts();
  }

  fetchFeaturedProducts(): void {
    this.isLoading.set(true);
    this.productService.getProducts({ limit: 8 }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.products.set(res.data);
          this.filterCategory('all');
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  filterCategory(cat: string): void {
    this.selectedCategory.set(cat);
    if (cat === 'all') {
      this.filteredProducts.set(this.products());
    } else {
      this.filteredProducts.set(this.products().filter(p => p.categorySlug === cat));
    }
  }

  copyCoupon(code: string): void {
    navigator.clipboard.writeText(code).then(() => {
      this.toastService.success(this.isArabic() ? `تم نسخ الكوبون: ${code}! استخدمه عند الدفع.` : `Copied code: ${code}! Paste it at checkout.`);
    });
  }
}
