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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {activeProducts.map((product) => (
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
                  <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
                    {product.name}
                  </h3>
                  {product.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      {formatPrice(product.priceInCents)}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    className="w-full bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-8"
                    disabled={product.stock === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    data-testid={`button-add-to-cart-${product.id}`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                    Sepete Ekle
                  </Button>
                </div>
              </Card>
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
