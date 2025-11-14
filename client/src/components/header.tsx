import { MapPin, ShoppingCart, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocation } from "wouter";
import { useCartContext } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import logoUrl from "@assets/Escape-Table-Logo---Koyu_1763093921312.png";

export function Header() {
  const [, setLocation] = useLocation();
  const { totalItems } = useCartContext();
  const { isAuthenticated, user } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-card-border">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4" />
            <span className="hidden md:inline">Teslimat Bölgesi:</span>
            <button 
              className="font-medium hover:underline"
              data-testid="button-select-region"
            >
              Fethiye, Datça, Kaş
            </button>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span className="text-sm hidden md:inline">
                  {user?.firstName || 'Hesabım'}
                </span>
              </div>
            ) : (
              <a 
                href="/api/auth/login"
                className="text-sm font-medium hover:underline"
                data-testid="link-login"
              >
                Giriş Yap / Kayıt Ol
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <button
            onClick={() => setLocation("/")}
            className="flex-shrink-0"
            data-testid="button-logo"
          >
            <img 
              src={logoUrl} 
              alt="EscapeTable" 
              className="h-8 md:h-10 w-auto"
            />
          </button>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Restoran, mutfak veya yemek ara"
                className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                data-testid="input-search"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Profile - Desktop */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/account")}
                className="hidden md:flex"
                data-testid="button-profile"
              >
                <User className="w-5 h-5" />
              </Button>
            )}

            {/* Cart */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLocation("/cart")}
              className="relative"
              data-testid="button-cart-header"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {totalItems > 9 ? "9+" : totalItems}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        {/* Search Bar - Mobile */}
        <div className="md:hidden mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Ürün ara..."
              className="w-full pl-9 pr-4 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              data-testid="input-search-mobile"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
