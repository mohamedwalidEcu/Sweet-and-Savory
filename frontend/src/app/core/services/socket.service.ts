import { Injectable, inject } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ToastService } from './toast.service';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket: Socket | null = null;
  private toastService = inject(ToastService);

  constructor() {
    this.initSocket();
  }

  private initSocket(): void {
    try {
      this.socket = io(environment.socketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });

      this.socket.on('connect', () => {
        console.log('[Socket.IO] Connected to Sweet & Savory live server');
      });

      this.socket.on('disconnect', () => {
        console.log('[Socket.IO] Disconnected from server');
      });
    } catch (err) {
      console.warn('[Socket.IO] Connection error:', err);
    }
  }

  joinUserRoom(userId: string): void {
    if (this.socket && userId) {
      this.socket.emit('join_user_room', userId);
    }
  }

  joinRoom(room: string): void {
    if (this.socket && room) {
      this.socket.emit('join_room', room);
      this.joinUserRoom(room);
    }
  }

  joinOrderRoom(orderId: string): void {
    if (this.socket && orderId) {
      this.socket.emit('join_order_room', orderId);
    }
  }

  listen<T = any>(event: string): Observable<T> {
    return new Observable((observer) => {
      if (!this.socket) return;
      this.socket.on(event, (data: T) => {
        observer.next(data);
      });
    });
  }

  onOrderStatusUpdated(): Observable<{ orderId: string; orderNumber: string; status: string; note: string }> {
    return new Observable((observer) => {
      if (!this.socket) return;
      this.socket.on('order_status_updated', (data) => {
        const readableStatus = data.status.replace(/_/g, ' ').toUpperCase();
        this.toastService.info(`Order #${data.orderNumber} is now: ${readableStatus}! 🍕`, 'Order Update');
        observer.next(data);
      });
    });
  }

  onSpecificOrderUpdated(orderId: string): Observable<any> {
    return new Observable((observer) => {
      if (!this.socket) return;
      this.socket.on(`order_${orderId}`, (data) => {
        observer.next(data);
      });
    });
  }

  onNewOrder(): Observable<any> {
    return new Observable((observer) => {
      if (!this.socket) return;
      this.socket.on('new_order', (data) => {
        this.toastService.success(`New order received! Order #${data.orderNumber} ($${data.total})`, 'Kitchen Notification');
        observer.next(data);
      });
    });
  }
}
