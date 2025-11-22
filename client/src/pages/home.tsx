import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/authUtils";
import { ShoppingCart, ChevronRight, Sparkles, AlertCircle, Zap, Clock, Flame, Search } from "lucide-react";
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
      {/* Campaigns / Special Offers Section */}
      {!isAuthenticated && (
        <SnowZone variant="primary">
          <section className="bg-primary py-8 md:py-12">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-2 gap-4 md:gap-6">
                {/* Main Campaign Card */}
                <Card className="relative overflow-visible bg-gradient-to-br from-red-600 to-red-700 dark:from-red-700 dark:to-red-800 border-0 hover-elevate active-elevate-2 transition-shadow duration-300" data-testid="card-campaign-main">
                  <div className="p-6 md:p-8">
                    <div className="flex items-start justify-between mb-4">
                      <Badge className="bg-white text-red-700 hover:bg-white font-bold text-xs px-3 py-1">
                        <Flame className="w-3 h-3 mr-1" />
                        ÖZEL KAMPANYA
                      </Badge>
                      <div className="bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
                        <p className="text-white text-xs font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Sınırlı Süre
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl md:text-6xl font-black text-white">%20</span>
                        <span className="text-2xl md:text-3xl font-bold text-white/90">İNDİRİM</span>
                      </div>
                      
                      <h3 className="text-xl md:text-2xl font-bold text-white">
                        İlk Siparişinize Özel!
                      </h3>
                      
                      <p className="text-white/90 text-sm md:text-base">
                        Kamp alanınıza ilk teslimatınızda 200 TL ve üzeri alışverişlerde geçerli
                      </p>
                      
                      <Button
                        onClick={() => setLocation("/categories")}
                        size="lg"
                        className="bg-white text-red-700 hover:bg-white/90 font-bold mt-4 w-full md:w-auto"
                        data-testid="button-campaign-shop"
                      >
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Alışverişe Başla
                        <ChevronRight className="w-5 h-5 ml-1" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                </Card>

                {/* Secondary Campaign Cards */}
                <div className="grid grid-rows-2 gap-4">
                  {/* Fast Delivery Card */}
                  <Card className="relative overflow-visible bg-gradient-to-br from-primary to-primary/90 border-2 border-primary-foreground/20 hover-elevate active-elevate-2 transition-shadow duration-300" data-testid="card-campaign-delivery">
                    <div className="p-4 md:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="bg-primary-foreground/20 p-2 rounded-lg">
                              <Zap className="w-5 h-5 text-primary-foreground" />
                            </div>
                            <Badge variant="outline" className="bg-primary-foreground/10 text-primary-foreground border-primary-foreground/30">
                              YENİ
                            </Badge>
                          </div>
                          <h4 className="text-lg md:text-xl font-bold text-primary-foreground mb-1">
                            Hızlı Teslimat
                          </h4>
                          <p className="text-primary-foreground/80 text-xs md:text-sm">
                            30-60 dakika içinde kamp alanınızda
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl md:text-3xl font-black text-primary-foreground">
                            30dk
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Free Shipping Card */}
                  <Card className="relative overflow-visible bg-gradient-to-br from-amber-600 to-amber-700 dark:from-amber-700 dark:to-amber-800 border-0 hover-elevate active-elevate-2 transition-shadow duration-300" data-testid="card-campaign-shipping">
                    <div className="p-4 md:p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <Badge className="bg-white text-amber-700 hover:bg-white font-bold text-xs px-2 py-1 mb-2">
                            <Sparkles className="w-3 h-3 mr-1" />
                            AVANTAJ
                          </Badge>
                          <h4 className="text-lg md:text-xl font-bold text-white mb-1">
                            Ücretsiz Teslimat
                          </h4>
                          <p className="text-white/80 text-xs md:text-sm">
                            150 TL ve üzeri siparişlerde
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl md:text-2xl font-black text-white">
                            0₺
                          </p>
                          <p className="text-xs text-white/70 line-through">49₺</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
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
