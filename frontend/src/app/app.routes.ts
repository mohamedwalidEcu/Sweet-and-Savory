import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
    title: 'Sweet & Savory | Artisan Pizza & Handcrafted Donuts',
  },
  {
    path: 'menu',
    loadComponent: () => import('./features/menu/menu.component').then(m => m.MenuComponent),
    title: 'Menu | Sweet & Savory',
  },
  {
    path: 'product/:slug',
    loadComponent: () => import('./features/product-detail/product-detail.component').then(m => m.ProductDetailComponent),
    title: 'Item Details | Sweet & Savory',
  },
  {
    path: 'cart',
    loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent),
    title: 'Your Craving Bag | Sweet & Savory',
  },
  {
    path: 'wishlist',
    loadComponent: () => import('./features/wishlist/wishlist.component').then(m => m.WishlistComponent),
    canActivate: [authGuard],
    title: 'Saved Cravings | Sweet & Savory',
  },
  {
    path: 'checkout',
    loadComponent: () => import('./features/checkout/checkout.component').then(m => m.CheckoutComponent),
    canActivate: [authGuard],
    title: 'Checkout | Sweet & Savory',
  },
  {
    path: 'orders',
    loadComponent: () => import('./features/orders/order-list/order-list.component').then(m => m.OrderListComponent),
    canActivate: [authGuard],
    title: 'Order History | Sweet & Savory',
  },
  {
    path: 'orders/:id',
    loadComponent: () => import('./features/orders/order-detail/order-detail.component').then(m => m.OrderDetailComponent),
    canActivate: [authGuard],
    title: 'Order Tracking & Invoice | Sweet & Savory',
  },
  {
    path: 'offers',
    loadComponent: () => import('./features/offers/offers.component').then(m => m.OffersComponent),
    title: 'Deals & Coupons | Sweet & Savory',
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Sign In | Sweet & Savory',
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent),
    title: 'Create Account | Sweet & Savory',
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/auth/profile/profile.component').then(m => m.ProfileComponent),
    canActivate: [authGuard],
    title: 'My Profile | Sweet & Savory',
  },

  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        title: 'Admin Dashboard | Sweet & Savory',
      },
      {
        path: 'orders',
        loadComponent: () => import('./features/admin/orders/admin-orders.component').then(m => m.AdminOrdersComponent),
        title: 'Manage Orders | Sweet & Savory',
      },
      {
        path: 'products',
        loadComponent: () => import('./features/admin/products/admin-products.component').then(m => m.AdminProductsComponent),
        title: 'Manage Products | Sweet & Savory',
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/admin-users.component').then(m => m.AdminUsersComponent),
        title: 'Manage Users | Sweet & Savory',
      },
      {
        path: 'coupons',
        loadComponent: () => import('./features/admin/coupons/admin-coupons.component').then(m => m.AdminCouponsComponent),
        title: 'Manage Coupons | Sweet & Savory',
      },
    ]
  },

  {
    path: '**',
    redirectTo: '',
  }
];
