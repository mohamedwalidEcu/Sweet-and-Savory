#  Sweet & Savory — Production-Level Food E-Commerce Platform

> **"Sweet cravings. Savory cravings. One place."**  
> An artisanal food e-commerce web application fusing 48-hour slow-fermented Neapolitan stone-baked pizzas with handcrafted Parisian brioche donuts, craft chilled beverages, and curated combo feasts.

Built with the **MEAN Stack**:
- **M**ongoDB (Mongoose 8 with indexing, text search, references, and aggregation pipelines)
- **E**xpress.js (Clean MVC architecture, Joi validators, centralized error handling, Multer file upload)
- **A**ngular 19 (Signals, Standalone Components, Reactive forms, View transitions, Custom SCSS design tokens, RTL support, Socket.IO client)
- **N**ode.js 24 (RESTful API server + Socket.IO real-time WebSocket server)

---

##  Brand Identity & Visual System

Sweet & Savory moves away from generic e-commerce templates with an editorial culinary aesthetic:

- **Color System**:
  - **Tomato Red** (`#E54523` / Dark: `#FF5A36`): Primary action accent, stone-fired heat, savory elements.
  - **Donut Pink** (`#E84589` / Dark: `#FF5C9D`): Playful pastry accent, sweet glazes, wishlist hearts.
  - **Crust Gold** (`#F0A31E` / Dark: `#FFB338`): Wood-fired crust highlights, star ratings, combo badges.
  - **Warm Cream Background** (`#FFF9F2` / Dark Charcoal: `#120E0C`): High-contrast, appetizing surface.
  - **Fresh Basil Green** (`#2B9348` / Dark: `#40B861`): In-stock indicators, verified reviews, savings.
- **Typography**:
  - **Display**: *Playfair Display* (Editorial serifs for memorable headlines).
  - **Headings**: *Space Grotesk* (Clean, energetic modern sans-serif).
  - **Body**: *Inter* (Readable, ergonomic layout).
  - **Accent**: *Caveat* (Chef handwritten notes, promo tags).
  - **Arabic**: *Cairo* (Modern Arabic typography with native RTL direction support).
- **Shapes**: A balance of neo-editorial sharp edges, soft card radii (14px), and tactile circular badge accents.

---

### 1. Customer Experience
- **Editorial Asymmetric Hero**: Dynamic collage combining stone-baked pizzas, glazed donuts, dual CTAs, and customer satisfaction trust indicators.
- **Distinct Category Showcases**: Individual visual treatments for Artisan Pizza (terracotta), Handcrafted Donuts (berry pink), Combos (bold gold & charcoal), and Chilled Drinks.
- **Interactive Combo Builder**: *"Why choose sweet OR savory? Choose BOTH."* Pair 1 pizza + 2 donuts + 2 drinks in a single craving feast.
- **Live Food Customization Engine**:
  - Pizzas: Small (8"), Medium (12"), Large (16") with toppings (Extra Mozzarella, Smoked Pepperoni, Hot Honey Drizzle, Garlic Mushrooms, Kalamata Olives, Grilled Chicken).
  - Donuts: Single, Box of 4, Box of 12 with glazes and toppings (Valrhona Ganache, Rainbow Sprinkles, 24K Gold Dust, Caramel Fudge).
  - Real-time unit and total price calculations as options are toggled.
- **Search, Filter & Sorting**:
  - Keyword search across product name, descriptions, and tags.
  - Category tabs and price ranges.
  - Sorting: Price low to high, price high to low, highest customer rating, newest additions.
- **Persistent Cart & Wishlist**:
  - Dual storage: Works seamlessly for guest visitors (localStorage) and synchronizes with MongoDB `/api/cart` upon login.
  - Quantity steppers, individual customization chips, special kitchen notes.
  - Dynamic coupon validation and application (e.g. `WELCOME10`, `SWEET20`, `SAVORY5`).
  - Automatic free delivery calculation for orders over $50.
- **Simulated Checkout & Payment**:
  - Multi-step customer delivery information (name, phone, street, delivery notes).
  - Payment method choices: Simulated credit card with card mockup (ready for Stripe elements) or Cash on Delivery.
- **Live Order Tracking & Status Stepper**:
  - Real-time status tracker: **Pending → Preparing (In Oven) → Out for Delivery → Delivered**.
  - Powered by **Socket.IO**: When the kitchen or admin updates an order status, the customer's screen updates instantly without refreshing.
  - Status history timeline log with timestamps.
- **Official Printable Tax Invoice**:
  - Clean printable layout with company logo, tax invoice badge, itemized breakdown, discounts, delivery fee, and payment confirmation.
  - CSS `@media print` rules hide UI controls and produce a clean PDF/print document.
- **Verified Customer Reviews**:
  - 1–5 star ratings with dynamic average recalculation in MongoDB aggregation.
  - Interactive submission form for logged-in foodies.
- **Dark Mode**: Complete custom properties mapping preserving food warmth and contrast.
- **Multi-Language (English & Arabic)**: Clean JSON i18n dictionary with automatic document `dir="rtl"` and `lang="ar"` switching.

### 2. Admin Portal (`/admin`)
- **Dashboard Overview**:
  - Real-time KPIs: Total Revenue, Total Orders, Registered Foodies, Menu Items, Pending Orders.
  - Recent orders table with direct status links.
  - Bestseller products leaderboard aggregated across orders.
- **Order Management**:
  - Filter by status (Pending, Preparing, Out for Delivery, Delivered).
  - Search by order number, customer name, or phone.
  - Change status dropdown: instantly broadcasts a WebSocket event to the connected customer.
- **Product Management**:
  - View all menu items.
  - Modal editor to add new food items or edit existing items (prices, discounts, stock, image URLs, badge text).
  - Delete product.
- **User Management**:
  - List all registered users.
  - Search by name or email.
  - Promote / demote roles (`user` ↔ `admin`).
  - Activate / deactivate accounts.
- **Coupon Engine**:
  - Create promotional coupon codes with percentage or fixed discount values, minimum order amounts, and expiration dates.
  - Delete expired coupons.

---

##  Demo Accounts

The database comes pre-seeded with realistic products, categories, coupons, and demo accounts:

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | `admin@sweetandsavory.com` | `AdminPassword123!` | Full Admin Portal (`/admin`) & Storefront |
| **Customer** | `sarah@example.com` | `UserPassword123!` | Storefront, Wishlist, Checkout, Orders |

> **Quick Login Buttons**: The login page includes 1-click demo buttons to fill credentials instantly.

---

##  Project Architecture

```
Final Project/
├── backend/
│   ├── config/
│   │   └── db.js                 # Mongoose connection
│   ├── controllers/
│   │   ├── authController.js     # Register, login, profile
│   │   ├── productController.js  # Product & Category CRUD + uploads
│   │   ├── categoryController.js # Category management
│   │   ├── cartController.js     # Cart operations
│   │   ├── wishlistController.js # Wishlist toggling
│   │   ├── orderController.js    # Order lifecycle + Socket.IO triggers
│   │   ├── couponController.js   # Coupon validation & management
│   │   ├── reviewController.js   # Product reviews & rating recalculation
│   │   └── adminController.js    # KPIs, metrics & user management
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT verification & role authorization
│   │   ├── errorMiddleware.js    # Centralized error handler
│   │   └── uploadMiddleware.js   # Multer file storage
│   ├── models/
│   │   ├── User.js               # User schema with bcrypt & JWT methods
│   │   ├── Category.js           # Category schema
│   │   ├── Product.js            # Product schema with customizations
│   │   ├── Cart.js               # Cart schema with items & subtotal
│   │   ├── Order.js              # Order schema with history & statuses
│   │   ├── Review.js             # Review schema with avg calculation
│   │   ├── Wishlist.js           # Wishlist schema
│   │   └── Coupon.js             # Coupon schema
│   ├── routes/                   # REST API routes
│   ├── services/                 # Business logic service layer
│   ├── seeds/
│   │   └── seed.js               # Realistic database seeder
│   ├── utils/
│   │   ├── apiResponse.js        # Standard response envelope
│   │   └── appError.js           # Operational error class
│   ├── validators/               # Joi input validation schemas
│   ├── app.js                    # Express app & middleware mounts
│   ├── server.js                 # HTTP + Socket.IO server entry point
│   ├── .env                      # Local environment configuration
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── core/
    │   │   │   ├── guards/       # authGuard, adminGuard
    │   │   │   ├── interceptors/ # authInterceptor, errorInterceptor
    │   │   │   ├── models/       # TypeScript interfaces
    │   │   │   └── services/     # Auth, Product, Cart, Wishlist, Order, Socket, Theme, Translation, Toast
    │   │   ├── shared/
    │   │   │   ├── components/   # Navbar, Footer, ProductCard, StarRating, Toast
    │   │   │   └── pipes/        # TranslatePipe
    │   │   ├── features/
    │   │   │   ├── home/         # Editorial homepage
    │   │   │   ├── menu/         # Full menu, search, filters, pagination
    │   │   │   ├── product-detail/# Gallery, dynamic customization, reviews
    │   │   │   ├── cart/         # Cart, coupon input, breakdown
    │   │   │   ├── wishlist/     # Saved items
    │   │   │   ├── checkout/     # Address & simulated payment
    │   │   │   ├── orders/       # Order history, live tracker & printable invoice
    │   │   │   ├── offers/       # Deals & promo codes
    │   │   │   ├── auth/         # Login, register, profile
    │   │   │   └── admin/        # Layout, Dashboard, Orders, Products, Users, Coupons
    │   │   ├── app.routes.ts     # Route definitions with lazy loading
    │   │   └── app.ts            # Root component
    │   ├── assets/
    │   │   └── i18n/             # en.json, ar.json
    │   └── styles/               # SCSS design tokens, mixins, typography, animations, RTL
    └── angular.json
```

---

## 🛠️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) running locally on `mongodb://127.0.0.1:27017` or a MongoDB Atlas URI

### 1. Backend Setup
```bash
cd backend
npm install

# Configure environment variables (preconfigured in .env)
# Start the server (runs on http://localhost:5000)
npm start

# In development mode with auto-reload:
npm run dev

# Seed database with realistic food items & demo users:
npm run seed
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start Angular development server (runs on http://localhost:4200)
npx ng serve --port 4200

# Production build:
npx ng build
```

---

##  API Endpoints Summary

### Authentication
- `POST /api/auth/register` — Register a new customer
- `POST /api/auth/login` — Sign in and receive JWT
- `GET  /api/auth/me` — Get authenticated user profile
- `PUT  /api/auth/me` — Update name, email, phone, address, or password

### Products & Categories
- `GET  /api/products` — Search, filter by category, price, rating, sort, paginate
- `GET  /api/products/:idOrSlug` — Get full product details by ID or slug
- `POST /api/products` *(Admin)* — Create new product
- `PUT  /api/products/:id` *(Admin)* — Update product details or stock
- `DELETE /api/products/:id` *(Admin)* — Delete product
- `POST /api/products/upload` *(Admin)* — Upload product photos
- `GET  /api/categories` — Get active categories

### Cart & Wishlist
- `GET    /api/cart` — Get user's cart
- `POST   /api/cart/add` — Add item with size, toppings, and flavors
- `PUT    /api/cart/items/:itemId` — Update quantity
- `DELETE /api/cart/items/:itemId` — Remove item
- `DELETE /api/cart/clear` — Empty cart
- `GET    /api/wishlist` — Get bookmarked products
- `POST   /api/wishlist/toggle` — Toggle favorite item

### Orders & Tracking
- `POST /api/orders` — Place order from cart with address & payment simulation
- `GET  /api/orders/my-orders` — Get customer order history
- `GET  /api/orders/:id` — Get single order tracking details & invoice
- `GET  /api/orders` *(Admin)* — List all orders with filters
- `PUT  /api/orders/:id/status` *(Admin)* — Update order status (triggers Socket.IO broadcast)

### Coupons & Reviews
- `POST /api/coupons/validate` — Validate promo code and calculate discount
- `GET  /api/coupons/public` — Get active public promotions
- `GET  /api/products/:productId/reviews` — Get reviews for a product
- `POST /api/products/:productId/reviews` — Post review and rating

---

##  Real-Time Socket.IO Architecture

When an order status is updated by the kitchen or admin:
1. **Admin triggers update**: Admin changes status from `pending` to `preparing` via the admin dashboard.
2. **Backend controller handles request**: `orderService.updateOrderStatus` saves the status history to MongoDB.
3. **Socket broadcast**: Server emits `order_status_updated` to room `user_${userId}` and `order_${orderId}`.
4. **Customer receives event in real time**: The customer's order tracker moves to the next step, a live badge pulses, and a toast notification pops up: *"Live update: Order is now PREPARING! "*, with zero page reloads.

---

##  Arabic RTL & Internationalization

Click the **العربية** button in the top announcement bar:
- The entire layout switches to Right-to-Left (`dir="rtl"`).
- Headings and body seamlessly adopt the modern Arabic font **Cairo**.
- Directional icons, buttons, badges, and pricing cards adapt their margins and layout symmetrically.
