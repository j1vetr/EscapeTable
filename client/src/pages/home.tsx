import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/authUtils";
import { ShoppingCart, ChevronRight, LogIn, Sparkles } from "lucide-react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import type { Category, Product } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();
  const { isAuthenticated } = useAuth();

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
      {/* Welcome Hero for Unauthenticated Users */}
      {!isAuthenticated && (
        <section className="bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground">
          <div className="px-4 py-12">
            <div className="max-w-2xl mx-auto text-center space-y-4">
              <div className="inline-flex items-center gap-2 bg-primary-foreground/10 px-4 py-2 rounded-full text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>Premium Kamp Deneyimi</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold font-heading">
                Kamp Keyfinizi Eksiksiz Yaşayın
              </h1>
              <p className="text-lg text-primary-foreground/90">
                Karavan parklarında unuttuğunuz ya da ihtiyacınız olan premium ürünleri size hızlıca ulaştırıyoruz.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button
                  size="lg"
                  asChild
                  className="bg-card hover:bg-card text-primary border-2 border-primary-foreground/20 shadow-lg"
                  data-testid="button-hero-login"
                >
                  <Link to="/login">
                    <LogIn className="w-5 h-5 mr-2" />
                    Giriş Yap ve Alışverişe Başla
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => {
                    document.querySelector('.categories-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="bg-primary-foreground/10 hover:bg-primary-foreground/20 border-primary-foreground/20 text-primary-foreground"
                  data-testid="button-browse-products"
                >
                  Ürünleri İncele
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Categories Carousel */}
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
            <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide">
              {activeCategories.map((category) => (
                <div
                  key={category.id}
                  className="group relative min-w-[180px] max-w-[180px] h-[140px] cursor-pointer"
                  onClick={() => setLocation(`/categories/${category.id}`)}
                  data-testid={`category-card-${category.id}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-3xl transition-all duration-500 group-hover:scale-105 group-hover:shadow-[0_0_40px_rgba(25,39,24,0.6)]"></div>
                  <div className="absolute inset-[2px] bg-gradient-to-br from-white/10 to-transparent rounded-3xl backdrop-blur-sm border border-white/20"></div>
                  <div className="absolute inset-0 flex items-center justify-center p-5">
                    <p className="text-xl font-black text-white text-center line-clamp-2 drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)]">
                      {category.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {activeFeaturedProducts.map((product) => (
                <div
                  key={product.id}
                  className="group relative cursor-pointer"
                  onClick={() => setLocation(`/products/${product.id}`)}
                  data-testid={`product-card-${product.id}`}
                >
                  <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-card transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
                    <div className="aspect-square overflow-hidden relative bg-gradient-to-br from-muted/30 to-muted/10">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ShoppingCart className="w-24 h-24 text-muted-foreground/20" />
                        </div>
                      )}
                      {product.stock > 0 ? (
                        <div className="absolute top-3 right-3 px-4 py-1.5 bg-primary/95 backdrop-blur-md rounded-full border border-white/30 shadow-lg">
                          <span className="text-xs font-bold text-white">Stokta</span>
                        </div>
                      ) : (
                        <div className="absolute top-3 right-3 px-4 py-1.5 bg-destructive/95 backdrop-blur-md rounded-full border border-white/30 shadow-lg">
                          <span className="text-xs font-bold text-white">Tükendi</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 space-y-3">
                      <h3 className="font-bold text-base line-clamp-2 min-h-[3rem] transition-colors group-hover:text-primary">
                        {product.name}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-black bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                          {formatPrice(product.priceInCents)}
                        </span>
                      </div>
                      <button
                        className="w-full relative overflow-hidden rounded-2xl bg-primary p-3.5 font-bold text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(25,39,24,0.4)] disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                        disabled={product.stock === 0}
                        data-testid={`button-add-to-cart-${product.id}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-700"></div>
                        <div className="relative flex items-center justify-center gap-2">
                          <ShoppingCart className="w-5 h-5" />
                          <span>Sepete Ekle</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Öne çıkan ürün bulunmuyor</p>
            </Card>
          )}
        </div>
      </section>
    </div>
  );
}
