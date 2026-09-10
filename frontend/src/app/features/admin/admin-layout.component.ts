import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';

import {
  LucideLayoutDashboard,
  LucideReceipt,
  LucidePizza,
  LucideUsers,
  LucideTicket,
  LucideStore,
  LucideSun,
  LucideMoon,
  LucideMenu,
  LucideX
} from '@lucide/angular';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    LucideLayoutDashboard,
    LucideReceipt,
    LucidePizza,
    LucideUsers,
    LucideTicket,
    LucideStore,
    LucideSun,
    LucideMoon,
    LucideMenu,
    LucideX
  ],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css'
})
export class AdminLayoutComponent {
  authService = inject(AuthService);
  themeService = inject(ThemeService);

  sidebarOpen = signal(false);

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar() {
    this.sidebarOpen.set(false);
  }
}
