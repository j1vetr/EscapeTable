import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/authUtils";
import { ShoppingCart, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import type { Category, Product } from "@shared/schema";

export default function Home() {
  const [, setLocation] = useLocation();

  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: featuredProducts, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products/featured"],
  });

  const activeCategories = categories?.filter((c) => c.isActive) || [];
  const activeFeaturedProducts = featuredProducts?.filter((p) => p.isActive) || [];

  return (
    <div className="pb-20">
      {/* Hero Banner */}
      <section className="relative bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/10" />
        <div className="relative px-4 py-12 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 font-heading">
            Kamp Keyfiniz Yarım Kalmasın
          </h1>
          <p className="text-primary-foreground/90 max-w-md mx-auto">
            Premium ürünlerle kamp deneyiminizi tamamlayın
          </p>
        </div>
      </section>

      {/* Categories Carousel */}
      <section className="py-6 bg-card">
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
                  className="min-w-[100px] p-4 text-center cursor-pointer hover-elevate active-elevate-2"
                  onClick={() => setLocation(`/categories/${category.id}`)}
                  data-testid={`category-card-${category.id}`}
                >
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                    <ShoppingCart className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-sm font-medium line-clamp-2">
                    {category.name}
                  </p>
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {activeFeaturedProducts.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden hover-elevate cursor-pointer"
                  onClick={() => setLocation(`/products/${product.id}`)}
                  data-testid={`product-card-${product.id}`}
                >
                  <div className="aspect-square bg-muted flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingCart className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <h3 className="font-medium line-clamp-2 text-sm">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(product.priceInCents)}
                      </span>
                      {product.stock > 0 ? (
                        <Badge variant="secondary" className="text-xs">
                          Stokta
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          Tükendi
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      className="w-full"
                      disabled={product.stock === 0}
                      data-testid={`button-add-to-cart-${product.id}`}
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
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
