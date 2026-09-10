import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, ApiResponse } from '../models';
import { ToastService } from './toast.service';

interface AuthResponseData {
  user: User;
  token: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private toastService = inject(ToastService);

  private readonly TOKEN_KEY = 'sweet_savory_jwt';
  private readonly USER_KEY = 'sweet_savory_user';

  currentUser = signal<User | null>(null);
  token = signal<string | null>(null);

  isLoggedIn = computed(() => !!this.currentUser() && !!this.token());
  isAdmin = computed(() => this.currentUser()?.role === 'admin');

  constructor() {
    this.initAuth();
  }

  private initAuth(): void {
    const savedToken = localStorage.getItem(this.TOKEN_KEY);
    const savedUser = localStorage.getItem(this.USER_KEY);

    if (savedToken && savedUser) {
      try {
        this.token.set(savedToken);
        this.currentUser.set(JSON.parse(savedUser));
        // Verify token with backend silently; only logout if server explicitly returns 401 (invalid/expired)
        this.fetchCurrentUser().subscribe({
          error: (err) => {
            if (err && err.status === 401) {
              this.logout(false);
            }
          },
        });
      } catch {
        this.logout(false);
      }
    }
  }

  register(userData: any): Observable<ApiResponse<AuthResponseData>> {
    return this.http.post<ApiResponse<AuthResponseData>>(`${environment.apiUrl}/auth/register`, userData).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.handleAuthSuccess(res.data);
          this.toastService.success(`Welcome to Sweet & Savory, ${res.data.user.name}!`);
        }
      })
    );
  }

  login(credentials: { email: string; password: string }): Observable<ApiResponse<AuthResponseData>> {
    return this.http.post<ApiResponse<AuthResponseData>>(`${environment.apiUrl}/auth/login`, credentials).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.handleAuthSuccess(res.data);
          this.toastService.success(`Welcome back, ${res.data.user.name}!`);
        }
      })
    );
  }

  fetchCurrentUser(): Observable<ApiResponse<{ user: User }>> {
    return this.http.get<ApiResponse<{ user: User }>>(`${environment.apiUrl}/auth/me`).pipe(
      tap((res) => {
        const user = res.data?.user || (res.data as any);
        if (res.success && user) {
          this.currentUser.set(user);
          localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
      })
    );
  }

  updateProfile(updateData: any): Observable<ApiResponse<AuthResponseData>> {
    return this.http.put<ApiResponse<AuthResponseData>>(`${environment.apiUrl}/auth/me`, updateData).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.handleAuthSuccess(res.data);
          this.toastService.success('Profile updated successfully');
        }
      })
    );
  }

  private handleAuthSuccess(data: AuthResponseData): void {
    this.token.set(data.token);
    this.currentUser.set(data.user);
    localStorage.setItem(this.TOKEN_KEY, data.token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
  }

  logout(showToast: boolean = true): void {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    if (showToast) {
      this.toastService.info('You have been logged out.');
    }
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return this.token() || localStorage.getItem(this.TOKEN_KEY);
  }
}
