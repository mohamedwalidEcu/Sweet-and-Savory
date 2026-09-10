import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, ApiResponse } from '../models';

export interface DashboardStats {
  kpis: {
    totalSales: number;
    totalOrders: number;
    totalUsers: number;
    totalProducts: number;
    pendingOrders: number;
  };
  recentOrders: any[];
  topProducts: any[];
  statusDistribution: { _id: string; count: number }[];
  salesTrend: { _id: string; dailyRevenue: number; orderCount: number }[];
}

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/admin`;

  getDashboardStats(): Observable<ApiResponse<DashboardStats>> {
    return this.http.get<ApiResponse<DashboardStats>>(`${this.baseUrl}/dashboard`);
  }

  getUsers(queryParams: { page?: number; limit?: number; search?: string; role?: string } = {}): Observable<ApiResponse<User[]>> {
    let params = new HttpParams();
    Object.entries(queryParams).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, v.toString());
      }
    });
    return this.http.get<ApiResponse<User[]>>(`${this.baseUrl}/users`, { params });
  }

  updateUserRole(userId: string, role: string, isActive?: boolean): Observable<ApiResponse<User>> {
    return this.http.put<ApiResponse<User>>(`${this.baseUrl}/users/${userId}`, { role, isActive });
  }
}
