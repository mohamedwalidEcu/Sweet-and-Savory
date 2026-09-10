export interface Address {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: Address;
  role: 'user' | 'admin';
  avatar?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  badgeText?: string;
  order?: number;
  isActive?: boolean;
}

export interface SizeOption {
  name: string;
  priceAdjustment: number;
  isDefault?: boolean;
}

export interface CustomizationOption {
  name: string;
  price: number;
  category?: string;
}

export interface NutritionalInfo {
  calories?: number;
  protein?: string;
  carbs?: string;
  fat?: string;
}

export interface Product {
  _id: string;
  name: string;
  nameAr?: string;
  slug: string;
  description: string;
  descriptionAr?: string;
  shortDescription?: string;
  category: Category | string;
  categorySlug: string;
  images: string[];
  price: number;
  discountPrice?: number | null;
  rating: number;
  reviewCount: number;
  stock: number;
  availableSizes?: SizeOption[];
  availableToppings?: CustomizationOption[];
  availableFlavors?: CustomizationOption[];
  ingredients?: string[];
  nutritionalInfo?: NutritionalInfo;
  preparationTime?: string;
  isFeatured?: boolean;
  isPopular?: boolean;
  badgeText?: string;
  tags?: string[];
  createdAt?: string;
}

export interface CartItem {
  _id?: string;
  product: Product | string;
  name: string;
  image: string;
  quantity: number;
  selectedSize: SizeOption;
  selectedToppings: CustomizationOption[];
  selectedFlavors: CustomizationOption[];
  unitPrice: number;
  itemTotal: number;
  specialInstructions?: string;
}

export interface Cart {
  _id?: string;
  user: string;
  items: CartItem[];
  subtotal: number;
}

export interface OrderStatusHistory {
  status: 'pending' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  note?: string;
  timestamp: string | Date;
}

export interface Order {
  _id: string;
  orderNumber: string;
  user: User | string;
  items: CartItem[];
  shippingAddress: {
    fullName: string;
    phone: string;
    street: string;
    city: string;
    state?: string;
    postalCode?: string;
    deliveryNotes?: string;
  };
  paymentInfo: {
    method: 'simulated_card' | 'cash_on_delivery' | 'stripe_ready';
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    transactionId?: string;
    cardLast4?: string;
  };
  orderStatus: 'pending' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  statusHistory: OrderStatusHistory[];
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  appliedCoupon?: {
    code: string;
    discountValue: number;
  };
  estimatedDeliveryTime?: string;
  createdAt: string;
}

export interface Review {
  _id: string;
  user: string;
  userName: string;
  userAvatar?: string;
  product: string;
  rating: number;
  comment: string;
  isVerifiedPurchase: boolean;
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  description?: string;
  type: 'percentage' | 'fixed';
  value: number;
  minOrder?: number;
  maxDiscount?: number;
  expirationDate: string;
  usageLimit?: number;
  usageCount?: number;
  isActive: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext?: boolean;
    hasPrev?: boolean;
  };
}
