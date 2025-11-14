import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/authUtils";
import { ShoppingCart, ArrowLeft } from "lucide-react";
import type { Category, Product } from "@shared/schema";

export default function CategoryDetail() {
  const [, params] = useRoute("/categories/:id");
  const [, setLocation] = useLocation();
  const categoryId = params?.id;

  const { data: category, isLoading: categoryLoading } = useQuery<Category>({
    queryKey: ["/api/categories", categoryId as string],
    enabled: !!categoryId,
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: [`/api/products?categoryId=${categoryId}`],
    enabled: !!categoryId,
  });

  const activeProducts = products?.filter((p) => p.isActive) || [];

  if (categoryLoading) {
    return (
      <div className="pb-20">
        <Skeleton className="h-32 w-full" />
        <div className="px-4 py-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="pb-20 px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Kategori bulunamadı</p>
          <Button onClick={() => setLocation("/categories")} data-testid="button-back-categories">
            Kategorilere Dön
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-3 text-primary-foreground hover:bg-primary-foreground/10"
          onClick={() => setLocation("/categories")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri
        </Button>
        <h1 className="text-2xl font-bold font-heading">{category.name}</h1>
        {category.description && (
          <p className="text-sm text-primary-foreground/80 mt-1">
            {category.description}
          </p>
        )}
      </div>

      {/* Products Grid */}
      <div className="px-4 py-6">
        {productsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : activeProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {activeProducts.map((product) => (
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
                    {product.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        {formatPrice(product.priceInCents)}
                      </span>
                    </div>
                    <button
                      className="w-full relative overflow-hidden rounded-2xl bg-primary p-3.5 font-bold text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(25,39,24,0.4)] disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                      disabled={product.stock === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                      data-testid={`button-add-to-cart-${product.id}`}
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
            <p className="text-muted-foreground">Bu kategoride ürün bulunmuyor</p>
          </Card>
        )}
      </div>
    </div>
  );
}
