import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/authUtils";
import { ShoppingCart, ChevronRight, LogIn, Sparkles, AlertCircle, Search } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useCartContext } from "@/context/CartContext";
import type { Category, Product } from "@shared/schema";
import EmptyState from "@/components/empty-state";
import SnowZone from "@/components/snow-zone";

export default function Home() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCartContext();

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: featuredProducts, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/featured/list"],
  });

  const activeCategories = categories?.filter((c) => c.isActive) || [];
  const activeFeaturedProducts = featuredProducts?.filter((p) => p.isActive) || [];

  return (
    <div className="pb-20">
      {/* Video Hero Section */}
      {!isAuthenticated && (
        <SnowZone variant="primary">
        <section className="relative h-[400px] md:h-[500px] overflow-hidden">
          {/* Video Background - Desktop only for performance */}
          <div className="absolute inset-0">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="hidden md:block w-full h-full object-cover"
              poster="https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&h=600&fit=crop"
            >
              <source src="https://videos.pexels.com/video-files/4827/4827-hd_1920_1080_30fps.mp4" type="video/mp4" />
            </video>
            {/* Poster image fallback for mobile */}
            <div 
              className="md:hidden w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: 'url(https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=1200&h=600&fit=crop)'
              }}
            />
            {/* Dark overlay for better text visibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-primary/90"></div>
          </div>

          {/* Content */}
          <div className="relative h-full flex items-center justify-center px-4 py-12">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 bg-primary-foreground/15 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-primary-foreground border border-primary-foreground/20">
                <Sparkles className="w-4 h-4" />
                <span>EscapeTable Premium</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-primary-foreground drop-shadow-lg">
                Premium Kurye Hizmeti
              </h1>
              
              <p className="text-lg md:text-xl text-primary-foreground/95 max-w-2xl mx-auto drop-shadow-md">
                Kamp alanlarına hızlı teslimat
              </p>
            </div>
          </div>
        </section>
        </SnowZone>
      )}

      {/* Categories Carousel */}
      <SnowZone variant="surface">
      <section className="py-6 bg-card categories-section">
        <div className="px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold font-heading">Kategoriler</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/categories")}
              data-testid="button-view-all-categories"
            >
              Tümü
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          
          {categoriesLoading ? (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="min-w-[100px] h-24 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {activeCategories.map((category) => {
                const isEmergency = category.name.toLowerCase().includes("acil");
                return (
                  <Card
                    key={category.id}
                    className={`group relative min-w-[120px] max-w-[120px] h-[120px] overflow-hidden cursor-pointer border-2 transition-all duration-300 hover:shadow-lg ${
                      isEmergency 
                        ? "border-red-600 dark:border-red-400 shadow-md shadow-red-500/40" 
                        : "border-primary"
                    }`}
                    onClick={() => setLocation(`/categories/${category.id}`)}
                    data-testid={`category-card-${category.id}`}
                  >
                    {category.imageUrl && (
                      <div className="absolute inset-0">
                        <img
                          src={category.imageUrl}
                          alt={category.name}
                          className="w-full h-full object-cover"
                        />
                        <div className={`absolute inset-0 ${isEmergency ? "bg-red-700/75 dark:bg-red-700/70" : "bg-primary/60"}`}></div>
                      </div>
                    )}
                    {isEmergency && (
                      <div className="absolute top-2 left-2">
                        <Badge variant="destructive" className="text-[9px] px-1.5 py-0.5 font-bold shadow-sm">
                          ACİL!
                        </Badge>
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center p-2 pt-8">
                      <p className="text-sm font-bold text-white text-center line-clamp-2 drop-shadow-md">
                        {category.name}
                      </p>
                    </div>
                    {isEmergency && (
                      <div className="absolute bottom-2 right-2 bg-red-600 dark:bg-red-500 rounded-full p-1">
                        <AlertCircle className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
      </SnowZone>

      {/* Featured Products */}
      <SnowZone variant="surface">
      <section className="py-6">
        <div className="px-4">
          <h2 className="text-xl font-semibold mb-4 font-heading">Öne Çıkanlar</h2>
          
          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          ) : activeFeaturedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {activeFeaturedProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group overflow-hidden cursor-pointer border-2 border-border bg-card transition-all duration-300 hover:shadow-lg hover:border-primary"
                  onClick={() => setLocation(`/products/${product.id}`)}
                  data-testid={`product-card-${product.id}`}
                >
                  <div className="aspect-[3/4] overflow-hidden relative bg-muted">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="w-16 h-16 text-muted-foreground/30" />
                      </div>
                    )}
                    {product.stock > 0 ? (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-primary rounded text-[10px] font-semibold text-white">
                        Stokta
                      </div>
                    ) : (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-destructive rounded text-[10px] font-semibold text-white">
                        Tükendi
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <h3 className="font-bold text-sm line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(product.priceInCents)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-8"
                        disabled={product.stock === 0}
                        data-testid={`button-add-to-cart-${product.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product, 1);
                        }}
                      >
                        <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                        Sepete Ekle
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/products/${product.id}`);
                        }}
                        data-testid={`button-view-product-${product.id}`}
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={ShoppingCart}
              title="Öne Çıkan Ürün Yok"
              description="Yakında premium kamp ürünleri eklenecek"
              illustration="products"
            />
          )}
        </div>
      </section>
      </SnowZone>
    </div>
  );
}
