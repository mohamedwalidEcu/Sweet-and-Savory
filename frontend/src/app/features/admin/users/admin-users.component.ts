import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { User } from '../../../core/models';
import { LucideSearch } from '@lucide/angular';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideSearch],
  templateUrl: './admin-users.component.html',
  styleUrl: './admin-users.component.css'
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);
  private toastService = inject(ToastService);

  users = signal<User[]>([]);
  isLoading = signal(true);
  searchQuery = '';

  ngOnInit(): void {
    this.fetchUsers();
  }

  fetchUsers(): void {
    this.isLoading.set(true);
    this.adminService.getUsers({ search: this.searchQuery }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.users.set(res.data);
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  toggleRole(user: User): void {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    this.adminService.updateUserRole(user._id, newRole).subscribe({
      next: () => {
        this.toastService.success(`Updated ${user.name}'s role to ${newRole}`);
        this.fetchUsers();
      }
    });
  }

  toggleActive(user: User): void {
    const newStatus = !(user.isActive !== false);
    this.adminService.updateUserRole(user._id, user.role, newStatus).subscribe({
      next: () => {
        this.toastService.info(`User account ${newStatus ? 'activated' : 'deactivated'}`);
        this.fetchUsers();
      }
    });
  }
}
