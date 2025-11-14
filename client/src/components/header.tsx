import { MapPin, User, Search, ChevronDown } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import type { CampingLocation } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoUrl from "@assets/Escape-Table-Logo---Koyu_1763093921312.png";

export function Header() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user } = useAuth();
  
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

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-card-border">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground">
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
              <button
                onClick={() => setLocation("/account")}
                className="hidden md:flex items-center gap-1 hover:underline"
                data-testid="button-profile-top"
              >
                <User className="w-4 h-4" />
              </button>
            ) : (
              <a 
                href="/api/auth/login"
                className="hidden md:inline text-sm font-medium hover:underline"
                data-testid="link-login-desktop"
              >
                Giriş Yap / Kayıt Ol
              </a>
            )}

            {/* Mobile: Text Link (NO CART - bottom nav has it) */}
            <div className="md:hidden">
              {isAuthenticated ? (
                <button
                  onClick={() => setLocation("/account")}
                  className="text-sm font-medium hover:underline"
                  data-testid="button-account-mobile"
                >
                  {user?.firstName || 'Hesabım'}
                </button>
              ) : (
                <a 
                  href="/api/auth/login"
                  className="text-sm font-medium hover:underline"
                  data-testid="link-login-mobile"
                >
                  Giriş Yap / Kayıt Ol
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
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
          <div className="w-full max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Ürün ara..."
                className="w-full pl-10 pr-4 py-2 rounded-md border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                data-testid="input-search"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
