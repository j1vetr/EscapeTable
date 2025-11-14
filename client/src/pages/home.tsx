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
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {activeCategories.map((category) => (
                <Card
                  key={category.id}
                  className="group relative min-w-[160px] max-w-[160px] h-[200px] overflow-hidden cursor-pointer border-0 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                  onClick={() => setLocation(`/categories/${category.id}`)}
                  data-testid={`category-card-${category.id}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/80"></div>
                  <div className="absolute inset-0 bg-muted flex items-center justify-center">
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
                      />
                    ) : (
                      <ShoppingCart className="w-16 h-16 text-white/30" />
                    )}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <p className="text-lg font-extrabold text-center text-white drop-shadow-lg line-clamp-3">
                      {category.name}
                    </p>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-card via-white to-card transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
                </Card>
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {activeFeaturedProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group relative overflow-hidden cursor-pointer border-0 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 rounded-2xl"
                  onClick={() => setLocation(`/products/${product.id}`)}
                  data-testid={`product-card-${product.id}`}
                >
                  <div className="aspect-square bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center overflow-hidden relative">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-2"
                      />
                    ) : (
                      <ShoppingCart className="w-20 h-20 text-muted-foreground/30" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    {product.stock > 0 ? (
                      <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm text-primary-foreground border-0 font-bold px-3 py-1 shadow-lg">
                        Stokta
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="absolute top-3 right-3 backdrop-blur-sm font-bold px-3 py-1 shadow-lg">
                        Tükendi
                      </Badge>
                    )}
                  </div>
                  <div className="p-5 space-y-4 bg-white dark:bg-card">
                    <h3 className="font-extrabold line-clamp-2 text-lg min-h-[3.5rem] group-hover:text-primary transition-colors duration-300">
                      {product.name}
                    </h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-black text-primary">
                        {formatPrice(product.priceInCents)}
                      </span>
                    </div>
                    <Button
                      size="default"
                      className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-extrabold text-base shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                      disabled={product.stock === 0}
                      data-testid={`button-add-to-cart-${product.id}`}
                    >
                      <ShoppingCart className="w-5 h-5 mr-2" />
                      Sepete Ekle
                    </Button>
                  </div>
                </Card>
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
