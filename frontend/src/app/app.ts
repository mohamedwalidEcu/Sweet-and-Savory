import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { AuthService } from './core/services/auth.service';
import { SocketService } from './core/services/socket.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, ToastComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private socketService = inject(SocketService);

  isAdminRoute = false;

  ngOnInit(): void {
    // Listen to route changes to toggle customer navbar/footer vs admin layout
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.isAdminRoute = event.urlAfterRedirects.startsWith('/admin');
      });

    // Connect user to their personal socket notification room if logged in
    const user = this.authService.currentUser();
    if (user?._id) {
      this.socketService.joinRoom(user._id);
    }

    // Subscribe to real-time order updates
    this.socketService.listen('orderStatusUpdated').subscribe((data) => {
      console.log('[Real-time notification] Order updated:', data);
    });
  }
}
