import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService, ProductFilterParams } from '../../core/services/product.service';
import { TranslationService } from '../../core/services/translation.service';
import { Product, Category } from '../../core/models';
import { ProductCardComponent } from '../../shared/components/product-card/product-card.component';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

import {
  LucideSearch,
  LucideX,
  LucidePizza,
  LucideDonut,
  LucideFlame,
  LucideCupSoda,
  LucideLayoutGrid,
  LucideUtensils
} from '@lucide/angular';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ProductCardComponent,
    TranslatePipe,
    LucideSearch,
    LucideX,
    LucidePizza,
    LucideDonut,
    LucideFlame,
    LucideCupSoda,
    LucideLayoutGrid,
    LucideUtensils
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  private productService = inject(ProductService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  translationService = inject(TranslationService);

  isArabic(): boolean {
    return this.translationService.currentLang() === 'ar';
  }

  products = signal<Product[]>([]);
  totalItems = signal<number>(0);
  totalPages = signal<number>(1);
  currentPage = signal<number>(1);
  isLoading = signal<boolean>(true);

  searchQuery = '';
  selectedCategory = 'all';
  sortBy = 'newest';

  ngOnInit(): void {
    // Read category from query params
    this.route.queryParams.subscribe((params) => {
      if (params['category']) {
        this.selectedCategory = params['category'];
      }
      this.fetchProducts();
    });
  }

  fetchProducts(): void {
    this.isLoading.set(true);
    const filterParams: ProductFilterParams = {
      page: this.currentPage(),
      limit: 12,
      sort: this.sortBy,
    };

    if (this.selectedCategory !== 'all') {
      filterParams.category = this.selectedCategory;
    }

    if (this.searchQuery.trim()) {
      filterParams.search = this.searchQuery.trim();
    }

    this.productService.getProducts(filterParams).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.products.set(res.data);
          this.totalItems.set(res.pagination?.total || res.data.length);
          this.totalPages.set(res.pagination?.pages || 1);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  applyFilters(): void {
    this.currentPage.set(1);
    this.fetchProducts();
  }

  setCategory(cat: string): void {
    this.selectedCategory = cat;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: cat === 'all' ? {} : { category: cat },
    });
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = 'all';
    this.sortBy = 'newest';
    this.router.navigate([], { relativeTo: this.route, queryParams: {} });
    this.applyFilters();
  }

  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages()) {
      this.currentPage.set(page);
      this.fetchProducts();
      window.scrollTo({ top: 300, behavior: 'smooth' });
    }
  }

  getPageArray(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages(); i++) {
      pages.push(i);
    }
    return pages;
  }
}
