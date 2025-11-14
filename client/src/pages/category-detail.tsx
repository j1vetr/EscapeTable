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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {activeProducts.map((product) => (
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
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                      {product.description}
                    </p>
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-primary">
                      {formatPrice(product.priceInCents)}
                    </span>
                  </div>
                  <Button
                    size="default"
                    className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-extrabold text-base shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
                    disabled={product.stock === 0}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add to cart logic will be implemented in integration phase
                    }}
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
            <p className="text-muted-foreground">Bu kategoride ürün bulunmuyor</p>
          </Card>
        )}
      </div>
    </div>
  );
}
