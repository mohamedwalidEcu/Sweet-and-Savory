import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'An unexpected error occurred. Please try again.';

      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else if (error.status === 0) {
        errorMessage = 'Unable to connect to server. Please check your network connection.';
      } else if (error.status === 401) {
        // Token expired or invalid
        if (!req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
          authService.logout(false);
          errorMessage = 'Your session has expired. Please log in again.';
        }
      } else if (error.status === 403) {
        errorMessage = error.error?.message || 'You are not authorized to perform this action.';
      }

      // Avoid showing toasts for normal 404s on product searches if needed, but display for errors
      if (!req.url.includes('/auth/me')) {
        toastService.error(errorMessage);
      }

      return throwError(() => error);
    })
  );
};
