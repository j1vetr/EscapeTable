# EscapeTable Design Guidelines

## Design Philosophy
**Premium Camping Luxury** - A natural, sophisticated aesthetic that merges outdoor adventure with refined service. Think Trendyol's polished mobile UX meets artisanal camping experiences.

## Color System (User-Specified)
- **Primary Brand**: Dark Green `#192718` (backgrounds, corporate emphasis, accents)
- **Contrast/Surface**: Cream `#f5e7da` (card backgrounds, section dividers, component surfaces)
- **Text**: Black or dark gray for maximum readability
- **Visual Mood**: Natural, premium, camping-luxury with strong contrasts

## Layout Architecture

### Mobile-First Trendyol-Style Structure
**Fixed Bottom Navigation** (5 tabs, always visible):
- Ana Sayfa | Kategoriler | Sepet | Siparişlerim | Hesabım
- Dark green active state, cream inactive

**Hero Section**:
- Large, immersive banner with tagline: "Kamp Keyfiniz Yarım Kalmasın"
- Full-width visual treatment
- EscapeTable logo + region selector at top

**Content Sections**:
1. **Horizontal Category Strip**: Swipeable carousel with large icons + names (Trendyol pattern)
2. **Featured Products Carousel**: Large product cards with cream backgrounds, dark green borders/headers
3. **Product Grid**: Spacious cards showing product, price, "Sepete Ekle" button prominently

### Spacing System
- **Card Padding**: Generous internal spacing (p-6 to p-8)
- **Section Breaks**: py-12 to py-16 between major sections
- **Grid Gaps**: gap-4 to gap-6 for product grids
- **Component Rhythm**: Consistent 4/8/16/24px increments

## Typography Hierarchy
- **Hero Headline**: Bold, large (text-4xl to text-5xl), dark green
- **Section Titles**: Semi-bold, text-2xl to text-3xl
- **Product Names**: Medium weight, text-lg
- **Body/Descriptions**: Regular, text-base, high contrast for readability
- **Buttons**: Medium weight, text-base to text-lg

## Component Design Patterns

### Product Cards
- Cream background (#f5e7da)
- Large product image (3:2 or 4:3 ratio)
- Product name, price prominently displayed
- Dark green "Sepete Ekle" button (full-width or prominent)
- Subtle shadow for depth

### Sticky Cart Summary
- Bottom-fixed mini cart (above navigation)
- Shows item count, total, "İlerle" button
- Slides up for full cart view

### Category Cards
- Large, tappable icons
- Horizontal scroll carousel
- Clear labels beneath icons
- Active state with dark green accent

### Order Status Badges
- Trendyol-style status indicators:
  - "Hazırlanıyor" - amber/warning tone
  - "Yolda" - blue/info tone  
  - "Teslim Edildi" - green/success
  - "İptal Edildi" - red/error

## Key User Flows

### Shopping Flow
1. **Browse**: Large hero → horizontal categories → featured products carousel → product grid
2. **Product Details**: Full-screen product view, large image, description, stock indicator, add to cart
3. **Cart**: Persistent bottom summary, full-screen cart with item management
4. **Checkout**: 
   - Step 1: Region selection (Fethiye/Datça/Kaş)
   - Step 2: Camping location picker or manual address
   - Step 3: Delivery time slot selection
   - Step 4: Payment method (Nakit/Havale)
   - Step 5: Order confirmation with ETA

### Order Tracking
- Clean list view with large status badges
- Expandable order details
- ETA timeline visualization

## Admin Panel Design
- **Sidebar Navigation**: Dark green with cream text
- **Dashboard**: Card-based metrics (daily/weekly orders, revenue, top products)
- **Data Tables**: Clean, sortable, with action buttons
- **Forms**: Spacious, well-labeled inputs on cream backgrounds
- **Status Management**: Clear visual states for order progression

## Images
**Hero Section**: 
- Full-width lifestyle image showing glamping/caravan setup with premium food spread
- Overlay with dark gradient for text readability
- Blurred-background buttons for CTAs

**Category Icons**: 
- Custom illustrated icons representing product categories (food, drinks, camping essentials)
- Consistent line-weight, simple style

**Product Images**: 
- High-quality photos on white/transparent backgrounds
- 1:1 or 3:4 aspect ratio for grid consistency

**Ambiance Photos**: 
- Scattered throughout featuring camping lifestyle, outdoor dining, sunset vistas
- Reinforce premium outdoor experience

## Accessibility & Interaction
- High contrast text on all backgrounds
- Large tap targets (min 44px)
- Clear focus states with dark green outlines
- Loading states for async operations
- Error messaging in clear, friendly language
- Success confirmations with visual feedback

## Visual Refinement
- **Minimal Animations**: Subtle transitions on card hover, smooth scroll behavior
- **Rounded Corners**: Consistent border-radius (8-12px) for cards and buttons
- **Shadows**: Soft, elevated feeling for cards floating on backgrounds
- **White Space**: Generous breathing room, never cramped