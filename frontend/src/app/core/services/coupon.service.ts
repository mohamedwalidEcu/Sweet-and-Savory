import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Coupon, ApiResponse } from '../models';

export interface CouponValidationResult {
  code: string;
  discountAmount: number;
  type: string;
  value: number;
  description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CouponService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/coupons`;

  validateCoupon(code: string, subtotal: number): Observable<ApiResponse<CouponValidationResult>> {
    return this.http.post<ApiResponse<CouponValidationResult>>(`${this.baseUrl}/validate`, { code, subtotal });
  }

  getPublicOffers(): Observable<ApiResponse<Partial<Coupon>[]>> {
    return this.http.get<ApiResponse<Partial<Coupon>[]>>(`${this.baseUrl}/public`);
  }

  // Admin
  getAllCoupons(): Observable<ApiResponse<Coupon[]>> {
    return this.http.get<ApiResponse<Coupon[]>>(this.baseUrl);
  }

  createCoupon(coupon: Partial<Coupon>): Observable<ApiResponse<Coupon>> {
    return this.http.post<ApiResponse<Coupon>>(this.baseUrl, coupon);
  }

  updateCoupon(id: string, coupon: Partial<Coupon>): Observable<ApiResponse<Coupon>> {
    return this.http.put<ApiResponse<Coupon>>(`${this.baseUrl}/${id}`, coupon);
  }

  deleteCoupon(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`);
  }
}
