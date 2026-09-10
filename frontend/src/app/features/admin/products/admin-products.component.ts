import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../core/services/product.service';
import { ToastService } from '../../../core/services/toast.service';
import { Product, SizeOption, CustomizationOption, Review } from '../../../core/models';
import { EgpPipe } from '../../../shared/pipes/egp.pipe';
import { LucidePlus, LucidePenSquare, LucideTrash2, LucideX, LucideStar, LucideMessageSquare } from '@lucide/angular';

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    EgpPipe,
    LucidePlus,
    LucidePenSquare,
    LucideTrash2,
    LucideX,
    LucideStar,
    LucideMessageSquare
  ],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.css'
})
export class AdminProductsComponent implements OnInit {
  private productService = inject(ProductService);
  private toastService = inject(ToastService);

  products = signal<Product[]>([]);
  isLoading = signal(true);
  isModalOpen = signal(false);
  isSaving = signal(false);
  editingProductId: string | null = null;

  hasDiscount = false;

  // Reviews Inspection Modal
  isReviewsModalOpen = signal(false);
  isLoadingReviews = signal(false);
  selectedProductForReviews = signal<Product | null>(null);
  productReviews = signal<Review[]>([]);

  // Add Customization Inputs
  newSizeName = '';
  newSizePrice: number = 0;
  newToppingName = '';
  newToppingPrice: number = 0;

  formData = {
    name: '',
    nameAr: '',
    categorySlug: 'pizza',
    description: '',
    descriptionAr: '',
    price: 150,
    discountPrice: null as number | null,
    stock: 50,
    imageUrl: '',
    badgeText: '',
    availableSizes: [] as SizeOption[],
    availableToppings: [] as CustomizationOption[],
  };

  ngOnInit(): void {
    this.fetchProducts();
  }

  fetchProducts(): void {
    this.isLoading.set(true);
    this.productService.getProducts({ limit: 100 }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.products.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  openAddModal(): void {
    this.editingProductId = null;
    this.hasDiscount = false;
    this.newSizeName = '';
    this.newSizePrice = 0;
    this.newToppingName = '';
    this.newToppingPrice = 0;
    this.formData = {
      name: '',
      nameAr: '',
      categorySlug: 'pizza',
      description: '',
      descriptionAr: '',
      price: 140,
      discountPrice: null,
      stock: 50,
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
      badgeText: 'New Recipe',
      availableSizes: [
        { name: 'Personal (8")', priceAdjustment: 0, isDefault: true },
        { name: 'Medium (12")', priceAdjustment: 40, isDefault: false },
        { name: 'Large (16")', priceAdjustment: 80, isDefault: false },
      ],
      availableToppings: [
        { name: 'Extra Mozzarella', price: 25, category: 'cheese' },
        { name: 'Hot Honey Drizzle', price: 20, category: 'sauce' },
      ],
    };
    this.isModalOpen.set(true);
  }

  openEditModal(product: Product): void {
    this.editingProductId = product._id;
    this.hasDiscount = !!(product.discountPrice && product.discountPrice > 0);
    this.newSizeName = '';
    this.newSizePrice = 0;
    this.newToppingName = '';
    this.newToppingPrice = 0;
    this.formData = {
      name: product.name,
      nameAr: product.nameAr || '',
      categorySlug: product.categorySlug,
      description: product.description,
      descriptionAr: product.descriptionAr || '',
      price: product.price,
      discountPrice: product.discountPrice || null,
      stock: product.stock,
      imageUrl: product.images[0] || '',
      badgeText: product.badgeText || '',
      availableSizes: product.availableSizes ? JSON.parse(JSON.stringify(product.availableSizes)) : [],
      availableToppings: product.availableToppings ? JSON.parse(JSON.stringify(product.availableToppings)) : [],
    };
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
  }

  // Size Options Management
  addSize(): void {
    if (!this.newSizeName.trim()) {
      this.toastService.error('Please enter size name');
      return;
    }
    const priceAdj = Number(this.newSizePrice) || 0;
    this.formData.availableSizes.push({
      name: this.newSizeName.trim(),
      priceAdjustment: priceAdj,
      isDefault: this.formData.availableSizes.length === 0,
    });
    this.newSizeName = '';
    this.newSizePrice = 0;
  }

  removeSize(index: number): void {
    this.formData.availableSizes.splice(index, 1);
  }

  // Topping Options Management
  addTopping(): void {
    if (!this.newToppingName.trim()) {
      this.toastService.error('Please enter topping name');
      return;
    }
    const price = Number(this.newToppingPrice) || 0;
    this.formData.availableToppings.push({
      name: this.newToppingName.trim(),
      price: price,
      category: 'general',
    });
    this.newToppingName = '';
    this.newToppingPrice = 0;
  }

  removeTopping(index: number): void {
    this.formData.availableToppings.splice(index, 1);
  }

  onToggleDiscount(): void {
    if (!this.hasDiscount) {
      this.formData.discountPrice = null;
    } else if (!this.formData.discountPrice && this.formData.price > 0) {
      this.formData.discountPrice = Math.round(this.formData.price * 0.85 * 100) / 100;
    }
  }

  onSaveProduct(): void {
    const basePrice = Number(this.formData.price);
    if (!basePrice || basePrice <= 0) {
      this.toastService.error('Please enter a valid base price');
      return;
    }

    let finalDiscountPrice: number | null = null;
    if (this.hasDiscount) {
      const disc = Number(this.formData.discountPrice);
      if (!disc || disc <= 0) {
        this.toastService.error('Please enter a valid discount price or disable the discount');
        return;
      }
      if (disc >= basePrice) {
        this.toastService.error('Discount price must be strictly less than base price (' + basePrice + ' EGP)');
        return;
      }
      finalDiscountPrice = disc;
    }

    this.isSaving.set(true);

    const payload = {
      name: this.formData.name,
      nameAr: this.formData.nameAr.trim(),
      category: this.formData.categorySlug,
      categorySlug: this.formData.categorySlug,
      description: this.formData.description,
      descriptionAr: this.formData.descriptionAr.trim(),
      price: basePrice,
      discountPrice: finalDiscountPrice,
      stock: Number(this.formData.stock),
      images: [this.formData.imageUrl],
      badgeText: this.formData.badgeText,
      availableSizes: this.formData.availableSizes,
      availableToppings: this.formData.availableToppings,
    };

    if (this.editingProductId) {
      this.productService.updateProduct(this.editingProductId, payload).subscribe({
        next: () => {
          this.toastService.success('Product updated successfully!');
          this.closeModal();
          this.fetchProducts();
          this.isSaving.set(false);
        },
        error: () => this.isSaving.set(false),
      });
    } else {
      this.productService.createProduct(payload).subscribe({
        next: () => {
          this.toastService.success('New product added successfully!');
          this.closeModal();
          this.fetchProducts();
          this.isSaving.set(false);
        },
        error: () => this.isSaving.set(false),
      });
    }
  }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(id).subscribe({
        next: () => {
          this.toastService.info('Product removed');
          this.fetchProducts();
        }
      });
    }
  }

  // Reviews Inspection Methods
  openReviewsModal(product: Product): void {
    this.selectedProductForReviews.set(product);
    this.isReviewsModalOpen.set(true);
    this.isLoadingReviews.set(true);
    this.productReviews.set([]);

    this.productService.getProductReviews(product._id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.productReviews.set(res.data);
        }
        this.isLoadingReviews.set(false);
      },
      error: () => {
        this.toastService.error('Failed to load reviews for this product');
        this.isLoadingReviews.set(false);
      }
    });
  }

  closeReviewsModal(): void {
    this.isReviewsModalOpen.set(false);
    this.selectedProductForReviews.set(null);
    this.productReviews.set([]);
  }

  onDeleteReview(reviewId: string): void {
    if (confirm('Are you sure you want to permanently delete this customer review?')) {
      this.productService.deleteReview(reviewId).subscribe({
        next: () => {
          this.toastService.success('Review deleted successfully');
          this.productReviews.update((list) => list.filter((r) => r._id !== reviewId));
          // Refresh products to recalculate average rating and review count
          this.fetchProducts();
        },
        error: () => {
          this.toastService.error('Failed to delete review');
        }
      });
    }
  }
}
