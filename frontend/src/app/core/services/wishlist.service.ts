import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Product, ApiResponse } from '../models';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class WishlistService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  private readonly STORAGE_KEY = 'sweet_savory_wishlist';

  products = signal<Product[]>([]);
  productIds = computed(() => new Set(this.products().map(p => p._id)));
  count = computed(() => this.products().length);

  constructor() {
    this.loadWishlist();
  }

  loadWishlist(): void {
    if (this.authService.isLoggedIn()) {
      this.http.get<ApiResponse<{ products: Product[] }>>(`${environment.apiUrl}/wishlist`).subscribe({
        next: (res) => {
          if (res.success && res.data && res.data.products) {
            this.products.set(res.data.products);
          }
        },
        error: () => this.loadFromStorage()
      });
    } else {
      this.products.set([]);
    }
  }

  private loadFromStorage(): void {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        this.products.set(JSON.parse(saved));
      } catch {
        this.products.set([]);
      }
    }
  }

  isWishlisted(productId: string): boolean {
    return this.productIds().has(productId);
  }

  toggleWishlist(product: Product): void {
    if (!this.authService.isLoggedIn()) {
      this.toastService.info('Please sign in to save items to your wishlist');
      return;
    }

    const exists = this.isWishlisted(product._id);
    this.http.post<ApiResponse<any>>(`${environment.apiUrl}/wishlist/toggle`, { productId: product._id }).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.wishlist) {
          this.products.set(res.data.wishlist.products || []);
          this.saveToStorage(res.data.wishlist.products || []);
          this.toastService.success(exists ? 'Removed from favorites' : 'Saved to favorites! ❤️');
        }
      }
    });
  }

  private saveToStorage(products: Product[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(products));
  }
}
