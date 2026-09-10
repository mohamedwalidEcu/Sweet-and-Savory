import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Cart, CartItem, Product, ApiResponse } from '../models';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  private readonly CART_STORAGE_KEY = 'sweet_savory_local_cart';

  items = signal<CartItem[]>([]);
  appliedCoupon = signal<{ code: string; discountAmount: number } | null>(null);

  itemCount = computed(() => this.items().reduce((sum, item) => sum + item.quantity, 0));
  subtotal = computed(() => {
    const raw = this.items().reduce((sum, item) => sum + item.itemTotal, 0);
    return Math.round(raw * 100) / 100;
  });
  discount = computed(() => this.appliedCoupon()?.discountAmount || 0);
  deliveryFee = computed(() => {
    if (this.subtotal() === 0) return 0;
    return this.subtotal() > 50 ? 0 : 3.50;
  });
  total = computed(() => {
    const calc = this.subtotal() - this.discount() + this.deliveryFee();
    return Math.max(0, Math.round(calc * 100) / 100);
  });

  constructor() {
    this.loadInitialCart();
  }

  private loadInitialCart(): void {
    if (this.authService.isLoggedIn()) {
      this.fetchBackendCart();
    } else {
      const savedCart = localStorage.getItem(this.CART_STORAGE_KEY);
      if (savedCart) {
        try {
          this.items.set(JSON.parse(savedCart));
        } catch {
          this.items.set([]);
        }
      }
    }
  }

  fetchBackendCart(): void {
    this.http.get<ApiResponse<Cart>>(`${environment.apiUrl}/cart`).subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.items) {
          this.items.set(res.data.items);
          localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(res.data.items));
        }
      },
      error: () => {
        // Fallback to local
        const saved = localStorage.getItem(this.CART_STORAGE_KEY);
        if (saved) this.items.set(JSON.parse(saved));
      }
    });
  }

  addToCart(payload: {
    product: Product;
    quantity: number;
    selectedSize?: any;
    selectedToppings?: any[];
    selectedFlavors?: any[];
    specialInstructions?: string;
  }): void {
    const { product, quantity, selectedSize, selectedToppings = [], selectedFlavors = [], specialInstructions = '' } = payload;

    const basePrice = product.discountPrice !== null && product.discountPrice !== undefined ? product.discountPrice : product.price;
    const sizeAdjustment = selectedSize?.priceAdjustment ? Number(selectedSize.priceAdjustment) : 0;
    const toppingsTotal = selectedToppings.reduce((acc, t) => acc + (Number(t.price) || 0), 0);
    const flavorsTotal = selectedFlavors.reduce((acc, f) => acc + (Number(f.price) || 0), 0);

    const unitPrice = Math.round((basePrice + sizeAdjustment + toppingsTotal + flavorsTotal) * 100) / 100;
    const itemTotal = Math.round((unitPrice * quantity) * 100) / 100;

    if (this.authService.isLoggedIn()) {
      this.http.post<ApiResponse<Cart>>(`${environment.apiUrl}/cart/add`, {
        productId: product._id,
        quantity,
        selectedSize: selectedSize || { name: 'Regular', priceAdjustment: 0 },
        selectedToppings,
        selectedFlavors,
        specialInstructions,
      }).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.items.set(res.data.items);
            this.saveLocalCart(res.data.items);
            this.toastService.success(`Added ${product.name} to your craving bag!`);
          }
        },
        error: (err) => {
          this.addLocalCartItem(product, quantity, selectedSize, selectedToppings, selectedFlavors, unitPrice, itemTotal, specialInstructions);
        }
      });
    } else {
      this.addLocalCartItem(product, quantity, selectedSize, selectedToppings, selectedFlavors, unitPrice, itemTotal, specialInstructions);
      this.toastService.success(`Added ${product.name} to your craving bag!`);
    }
  }

  private addLocalCartItem(
    product: Product,
    quantity: number,
    selectedSize: any,
    selectedToppings: any[],
    selectedFlavors: any[],
    unitPrice: number,
    itemTotal: number,
    specialInstructions: string
  ): void {
    const current = [...this.items()];
    const existingIndex = current.findIndex(item => {
      const pId = typeof item.product === 'string' ? item.product : item.product._id;
      return pId === product._id &&
        item.selectedSize?.name === (selectedSize?.name || 'Regular') &&
        JSON.stringify(item.selectedToppings?.map(t => t.name).sort()) === JSON.stringify(selectedToppings.map(t => t.name).sort()) &&
        JSON.stringify(item.selectedFlavors?.map(f => f.name).sort()) === JSON.stringify(selectedFlavors.map(f => f.name).sort());
    });

    if (existingIndex > -1) {
      current[existingIndex].quantity += quantity;
      current[existingIndex].itemTotal = Math.round((current[existingIndex].quantity * current[existingIndex].unitPrice) * 100) / 100;
    } else {
      current.push({
        _id: 'local-' + Date.now() + Math.random().toString(36).substr(2, 4),
        product,
        name: product.name,
        image: product.images[0],
        quantity,
        selectedSize: selectedSize || { name: 'Regular', priceAdjustment: 0 },
        selectedToppings,
        selectedFlavors,
        unitPrice,
        itemTotal,
        specialInstructions,
      });
    }

    this.items.set(current);
    this.saveLocalCart(current);
  }

  updateQuantity(itemId: string, quantity: number): void {
    if (this.authService.isLoggedIn() && !itemId.startsWith('local-')) {
      this.http.put<ApiResponse<Cart>>(`${environment.apiUrl}/cart/items/${itemId}`, { quantity }).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.items.set(res.data.items);
            this.saveLocalCart(res.data.items);
          }
        }
      });
    } else {
      let current = [...this.items()];
      if (quantity <= 0) {
        current = current.filter(i => i._id !== itemId);
      } else {
        const item = current.find(i => i._id === itemId);
        if (item) {
          item.quantity = quantity;
          item.itemTotal = Math.round((item.unitPrice * quantity) * 100) / 100;
        }
      }
      this.items.set(current);
      this.saveLocalCart(current);
    }
  }

  removeItem(itemId: string): void {
    if (this.authService.isLoggedIn() && !itemId.startsWith('local-')) {
      this.http.delete<ApiResponse<Cart>>(`${environment.apiUrl}/cart/items/${itemId}`).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.items.set(res.data.items);
            this.saveLocalCart(res.data.items);
            this.toastService.info('Item removed from cart');
          }
        }
      });
    } else {
      const current = this.items().filter(i => i._id !== itemId);
      this.items.set(current);
      this.saveLocalCart(current);
      this.toastService.info('Item removed from cart');
    }
  }

  clearCart(): void {
    if (this.authService.isLoggedIn()) {
      this.http.delete<ApiResponse<any>>(`${environment.apiUrl}/cart/clear`).subscribe();
    }
    this.items.set([]);
    this.appliedCoupon.set(null);
    localStorage.removeItem(this.CART_STORAGE_KEY);
  }

  setCoupon(coupon: { code: string; discountAmount: number } | null): void {
    this.appliedCoupon.set(coupon);
  }

  private saveLocalCart(items: CartItem[]): void {
    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));
  }
}
