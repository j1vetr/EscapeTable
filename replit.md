# EscapeTable - Premium Camping Delivery Platform

## Overview

EscapeTable is a specialized e-commerce platform designed to deliver premium food and beverage products to camping, caravan, and glamping customers. The platform focuses on rapid delivery of forgotten or urgently needed items to camping locations across Turkish coastal regions (Fethiye, Datça, Kaş). Built with a mobile-first approach inspired by Trendyol's UX patterns, it features a sophisticated delivery slot system, regional coverage management, and role-based access for customers, personnel, and administrators.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type safety
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TailwindCSS for styling with custom design tokens
- shadcn/ui component library (Radix UI primitives)

**Design Philosophy:**
The UI follows a "Premium Camping Luxury" aesthetic with a nature-inspired color palette. The primary brand color is dark green (#192718) used for backgrounds and emphasis, contrasted with cream (#f5e7da) for card surfaces. The design mimics Trendyol's mobile-first UX patterns with a fixed bottom navigation bar, horizontal scrolling carousels, and generous card-based layouts.

**State Management:**
- TanStack Query (React Query) for server state management and caching
- Context API for cart state (CartContext) persisted to localStorage
- Custom hooks pattern for authentication (useAuth) and cart operations (useCart)

**Routing Strategy:**
The application implements a dual-router pattern:
- Customer-facing routes (home, categories, cart, checkout, orders, account) with fixed bottom navigation
- Admin routes (/admin/*) with a persistent sidebar navigation
- Landing page for unauthenticated users

**Key UI Patterns:**
- Mobile-first responsive design with breakpoint at 768px
- Fixed 5-tab bottom navigation (Ana Sayfa, Kategoriler, Sepet, Siparişlerim, Hesabım)
- Horizontal scrolling category strips and product carousels
- Large, touch-friendly product cards with cream backgrounds
- Multi-step checkout flow with progressive disclosure
- Optimistic UI updates with React Query mutations

### Backend Architecture

**Framework & Runtime:**
- Express.js running on Node.js with TypeScript
- ESM module system throughout
- Development mode with tsx, production with esbuild bundling

**API Design:**
RESTful API structure with resource-based endpoints under `/api/*`:
- Public endpoints: `/api/categories`, `/api/products/*`
- Authenticated endpoints: `/api/user`, `/api/orders`
- Admin-protected endpoints: `/admin/*` routes with role-based middleware

**Middleware Stack:**
1. JSON body parsing with raw body capture (for potential webhook verification)
2. URL-encoded form data support
3. Request/response logging with timing
4. Session management via express-session
5. Authentication via Replit Auth (OpenID Connect)
6. Role-based authorization middleware (isAuthenticated, isAdminOrPersonnel)

**Authentication & Authorization:**
- OpenID Connect integration with Replit Auth
- Passport.js strategy for OIDC flow
- Session storage in PostgreSQL (connect-pg-simple)
- Three user roles: customer (default), personnel, admin
- Token refresh handling for expired access tokens
- Session TTL of 7 days with HTTP-only secure cookies

**Data Validation:**
- Zod schemas for runtime type validation
- Drizzle-Zod integration for database schema validation
- Insert schemas generated from database tables
- Validation error formatting with zod-validation-error

### Data Storage

**Database:**
PostgreSQL exclusively via Neon serverless driver with WebSocket support. No KV stores or alternative databases are used.

**ORM & Schema Management:**
- Drizzle ORM for type-safe database queries
- Schema-first approach with TypeScript definitions
- Drizzle Kit for migrations (stored in `/migrations`)
- Database schema located in `shared/schema.ts` for sharing between client and server

**Core Database Entities:**

1. **Sessions Table** - Required for Replit Auth, stores Express session data with expiration

2. **Users** - Central authentication entity
   - UUID primary key, email unique identifier
   - Role enum: customer, admin, personnel
   - Profile information: firstName, lastName, profileImageUrl
   - Timestamps for created/updated tracking

3. **Categories** - Product organization hierarchy
   - Name, description, display order (sortOrder)
   - Active/inactive flag for visibility control

4. **Products** - Inventory items
   - Name, description, price (stored in cents for precision)
   - Image URL for product photos
   - Category relationship (foreign key)
   - Stock quantity tracking
   - Active/inactive flag
   - Featured flag for homepage carousel

5. **Delivery Regions** - Geographic service areas
   - Name (e.g., Fethiye, Datça, Kaş)
   - Min/Max estimated delivery time
   - Active status for seasonal operations

6. **Camping Locations** - Pre-defined delivery addresses
   - Name and full address
   - Region relationship for filtering
   - Active status

7. **Delivery Slots** - Time-based delivery windows
   - Region-specific availability
   - Start/end time for slot window
   - Active status for capacity management

8. **Orders** - Customer purchase records
   - User relationship (foreign key)
   - Region, location (can be custom address)
   - Delivery slot selection
   - Order status enum: preparing, on_delivery, delivered, cancelled
   - Payment method enum: cash, bank_transfer
   - Total amount in cents
   - Timestamps for tracking lifecycle

9. **Order Items** - Line items within orders
   - Order relationship
   - Product snapshot (ID, name, price at time of order)
   - Quantity ordered
   - Subtotal calculation

10. **Stock Movements** - Inventory audit trail
    - Product relationship
    - Quantity delta (positive/negative)
    - Movement type, reference, notes
    - User who performed the action

11. **Settings** - Key-value configuration store
    - Unique key identifier
    - JSON value for flexibility
    - Description for documentation

12. **Audit Logs** - System-wide activity tracking
    - User, action type, entity references
    - Before/after state snapshots
    - IP address and metadata capture

**Database Relations:**
- Drizzle relations defined for all foreign keys
- One-to-many: user→orders, category→products, region→locations, order→orderItems
- Many-to-one: products→category, orders→user, locations→region

### External Dependencies

**Third-Party Services:**

1. **Replit Authentication** (OIDC Provider)
   - Purpose: User authentication and session management
   - Integration: Passport.js OIDC strategy
   - Environment: ISSUER_URL, REPL_ID, SESSION_SECRET
   - User data: Claims for email, name, profile image

2. **Neon Database** (PostgreSQL as a Service)
   - Purpose: Primary data persistence
   - Driver: @neondatabase/serverless with WebSocket support
   - Environment: DATABASE_URL
   - Features: Connection pooling, serverless compatibility

**Development Tools:**

1. **Replit Development Plugins** (dev-only)
   - vite-plugin-runtime-error-modal for error overlays
   - vite-plugin-cartographer for file navigation
   - vite-plugin-dev-banner for environment indicators
   - Conditionally loaded based on NODE_ENV and REPL_ID

**Font Services:**
- Google Fonts CDN for Inter and Poppins font families
- Preconnect optimization for performance

**Key NPM Dependencies:**
- UI Framework: React 18, Radix UI primitives
- Styling: TailwindCSS, class-variance-authority, clsx
- Data Fetching: @tanstack/react-query
- Forms: react-hook-form, @hookform/resolvers
- Date Handling: date-fns with Turkish locale
- Routing: wouter (lightweight alternative to React Router)
- ORM: drizzle-orm, drizzle-zod
- Validation: zod

**Build & Deployment:**
- Development: Vite dev server with HMR
- Production: Vite build for client, esbuild for server bundling
- Static assets served from `dist/public`
- Server bundle output to `dist/index.js`