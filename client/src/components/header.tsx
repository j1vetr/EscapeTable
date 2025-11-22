import { MapPin, User, Search, ChevronDown, LogIn } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useRef } from "react";
import type { CampingLocation, Product } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTypingPlaceholder } from "@/hooks/useTypingPlaceholder";
import { formatPrice } from "@/lib/authUtils";
import logoUrl from "@assets/Escape-Table-Logo---Koyu_1763093921312.webp";
import SnowZone from "@/components/snow-zone";

export function Header() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  
  // Fetch all products for placeholder animation
  const { data: allProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  const productNames = (allProducts?.map(p => p.name) || []).slice(0, 10);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  
  // Animated placeholder
  const placeholder = useTypingPlaceholder(productNames, searchQuery.length > 0);
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Search products
  const { data: searchResults } = useQuery<Product[]>({
    queryKey: ["/api/products/search", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery || debouncedQuery.length < 3) return [];
      const res = await fetch(`/api/products/search?q=${encodeURIComponent(debouncedQuery)}`, {
        credentials: "include",
      });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: debouncedQuery.length >= 3,
  });
  
  // Show/hide search results
  useEffect(() => {
    setShowSearchResults(searchQuery.length >= 3 && (searchResults?.length ?? 0) > 0);
  }, [searchQuery, searchResults]);
  
  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  // Fetch camping locations
  const { data: campingLocations } = useQuery<CampingLocation[]>({
    queryKey: ["/api/camping-locations"],
  });

  // Selected location state
  const [selectedLocation, setSelectedLocation] = useState<CampingLocation | null>(null);

  // Load selected location from localStorage on mount
  useEffect(() => {
    const savedLocationId = localStorage.getItem("selectedCampingLocationId");
    if (savedLocationId && campingLocations) {
      const location = campingLocations.find(loc => loc.id === savedLocationId);
      if (location) {
        setSelectedLocation(location);
      }
    }
  }, [campingLocations]);

  const handleLocationSelect = (location: CampingLocation) => {
    setSelectedLocation(location);
    localStorage.setItem("selectedCampingLocationId", location.id);
  };
  
  const handleProductClick = (productId: string) => {
    setSearchQuery("");
    setShowSearchResults(false);
    setLocation(`/products/${productId}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-card-border">
      {/* Top Bar */}
      <SnowZone variant="primary" className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4" />
            <span className="hidden md:inline">Teslimat Adresi:</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="font-medium hover:underline flex items-center gap-1"
                  data-testid="button-select-location"
                >
                  {selectedLocation ? selectedLocation.name : "Kamp Alanı Seçin"}
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                {campingLocations?.map((location) => (
                  <DropdownMenuItem
                    key={location.id}
                    onClick={() => handleLocationSelect(location)}
                    data-testid={`location-${location.id}`}
                  >
                    {location.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-3">
            {/* Desktop: Profile/Login (NO CART - bottom nav has it) */}
            {isAuthenticated ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation("/account")}
                className="hidden md:flex items-center gap-2 text-primary-foreground hover:bg-primary-foreground/10"
                data-testid="button-profile-top"
              >
                <span className="font-medium">
                  {user?.firstName 
                    ? `Merhaba ${user.firstName}` 
                    : 'Merhaba'}
                </span>
                <User className="w-4 h-4" />
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                asChild
                className="hidden md:flex items-center gap-2 bg-card hover:bg-card text-primary border-primary-foreground/20"
                data-testid="link-login-desktop"
              >
                <Link to="/login">
                  <LogIn className="w-4 h-4" />
                  <span className="font-medium">Giriş Yap</span>
                </Link>
              </Button>
            )}

            {/* Mobile: Button Style */}
            <div className="md:hidden">
              {isAuthenticated ? (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocation("/account")}
                  className="text-primary-foreground hover:bg-primary-foreground/10 flex items-center gap-2"
                  data-testid="button-account-mobile"
                >
                  <span className="font-medium text-sm">
                    {user?.firstName 
                      ? `Merhaba ${user.firstName}` 
                      : 'Merhaba'}
                  </span>
                  <User className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="bg-card hover:bg-card text-primary border-primary-foreground/20"
                  data-testid="link-login-mobile"
                >
                  <Link to="/login">
                    <LogIn className="w-4 h-4" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </SnowZone>

      {/* Main Header */}
      <SnowZone variant="surface" className="py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center gap-4">
            {/* Logo - Centered and Larger */}
            <button
              onClick={() => setLocation("/")}
              className="flex-shrink-0"
              data-testid="button-logo"
            >
              <img 
                src={logoUrl} 
                alt="EscapeTable" 
                className="h-12 md:h-16 w-auto"
              />
            </button>

            {/* Search Bar */}
            <div className="w-full max-w-2xl" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={placeholder}
                  className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  data-testid="input-search"
                />
                
                {/* Search Results Dropdown */}
                {showSearchResults && searchResults && searchResults.length > 0 && (
                  <Card className="absolute top-full mt-2 w-full max-h-96 overflow-y-auto shadow-lg z-50">
                    <div className="divide-y">
                      {searchResults.map((product) => (
                        <button
                          key={product.id}
                          onClick={() => handleProductClick(product.id)}
                          className="w-full p-3 flex items-center gap-3 hover-elevate active-elevate-2 text-left"
                          data-testid={`search-result-${product.id}`}
                        >
                          <div className="w-16 h-16 flex-shrink-0 bg-muted rounded overflow-hidden">
                            {product.imageUrl ? (
                              <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-muted" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm truncate">{product.name}</h4>
                            <p className="text-lg font-bold text-primary mt-1">
                              {formatPrice(product.priceInCents)}
                            </p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </SnowZone>
    </header>
  );
}
