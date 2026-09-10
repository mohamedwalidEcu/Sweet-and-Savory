import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, Category, Review, ApiResponse } from '../models';

export interface ProductFilterParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  sort?: string;
  isFeatured?: boolean;
  isPopular?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/products`;

  getProducts(filterParams: ProductFilterParams = {}): Observable<ApiResponse<Product[]>> {
    let params = new HttpParams();

    Object.entries(filterParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<ApiResponse<Product[]>>(this.baseUrl, { params });
  }

  getProduct(idOrSlug: string): Observable<ApiResponse<Product>> {
    return this.http.get<ApiResponse<Product>>(`${this.baseUrl}/${idOrSlug}`);
  }

  getCategories(): Observable<ApiResponse<Category[]>> {
    return this.http.get<ApiResponse<Category[]>>(`${environment.apiUrl}/categories`);
  }

  createProduct(product: Partial<Product>): Observable<ApiResponse<Product>> {
    return this.http.post<ApiResponse<Product>>(this.baseUrl, product);
  }

  updateProduct(id: string, product: Partial<Product>): Observable<ApiResponse<Product>> {
    return this.http.put<ApiResponse<Product>>(`${this.baseUrl}/${id}`, product);
  }

  deleteProduct(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }

  uploadImages(formData: FormData): Observable<ApiResponse<{ imageUrls: string[] }>> {
    return this.http.post<ApiResponse<{ imageUrls: string[] }>>(`${this.baseUrl}/upload`, formData);
  }

  // Reviews
  getProductReviews(productId: string): Observable<ApiResponse<Review[]>> {
    return this.http.get<ApiResponse<Review[]>>(`${environment.apiUrl}/products/${productId}/reviews`);
  }

  addReview(productId: string, review: { rating: number; comment: string }): Observable<ApiResponse<Review>> {
    return this.http.post<ApiResponse<Review>>(`${environment.apiUrl}/products/${productId}/reviews`, review);
  }

  deleteReview(reviewId: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${environment.apiUrl}/reviews/${reviewId}`);
  }
}
