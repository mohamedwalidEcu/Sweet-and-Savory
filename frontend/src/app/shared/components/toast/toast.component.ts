import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

import { LucideCheckCircle2, LucideAlertCircle, LucideAlertTriangle, LucideBell, LucideX } from '@lucide/angular';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [
    CommonModule,
    LucideCheckCircle2,
    LucideAlertCircle,
    LucideAlertTriangle,
    LucideBell,
    LucideX
  ],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.css'
})
export class ToastComponent {
  toastService = inject(ToastService);
}
