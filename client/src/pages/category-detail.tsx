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
    queryKey: ["/api/categories", categoryId],
    enabled: !!categoryId,
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products", { categoryId }],
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeProducts.map((product) => (
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
                  {product.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                  )}
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
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add to cart logic will be implemented in integration phase
                    }}
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
            <p className="text-muted-foreground">Bu kategoride ürün bulunmuyor</p>
          </Card>
        )}
      </div>
    </div>
  );
}
