import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/authUtils";
import { ShoppingCart, Sparkles } from "lucide-react";
import { useLocation } from "wouter";
import { useCartContext } from "@/context/CartContext";
import type { Product } from "@shared/schema";
import { useState } from "react";

interface ProductRecommendationsProps {
  categoryIds: string[];
  excludeProductIds: string[];
  title?: string;
  maxItems?: number;
}

export default function ProductRecommendations({
  categoryIds,
  excludeProductIds,
  title = "Bunları da Beğenebilirsiniz",
  maxItems = 4,
}: ProductRecommendationsProps) {
  const [, setLocation] = useLocation();
  const { addToCart } = useCartContext();
  const [addingProduct, setAddingProduct] = useState<string | null>(null);

  // Fetch all products
  const { data: allProducts, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Filter products: same categories, not in cart, active, in stock
  const recommendations = allProducts
    ?.filter(
      (p) =>
        p.isActive &&
        p.stock > 0 &&
        categoryIds.includes(p.categoryId || "") &&
        !excludeProductIds.includes(p.id)
    )
    .slice(0, maxItems) || [];

  if (isLoading) {
    return (
      <div className="py-6">
        <h2 className="text-lg font-semibold mb-4 px-4 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          {title}
        </h2>
        <div className="px-4">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="min-w-[160px] h-56 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="py-6 bg-muted/30">
      <h2 className="text-lg font-semibold mb-4 px-4 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        {title}
      </h2>
      <div className="px-4">
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {recommendations.map((product) => (
            <Card
              key={product.id}
              className="group min-w-[160px] max-w-[160px] overflow-hidden cursor-pointer border-2 border-border bg-card transition-all duration-300 hover:shadow-lg hover:border-primary"
              data-testid={`recommendation-card-${product.id}`}
            >
              <div
                className="aspect-[3/4] overflow-hidden relative bg-muted"
                onClick={() => setLocation(`/products/${product.id}`)}
              >
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="p-2 space-y-1">
                <h3
                  className="font-bold text-xs line-clamp-2 min-h-[2rem] cursor-pointer"
                  onClick={() => setLocation(`/products/${product.id}`)}
                >
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-primary">
                    {formatPrice(product.priceInCents)}
                  </span>
                </div>
                <Button
                  size="sm"
                  className={`w-full text-xs h-7 transition-transform ${
                    addingProduct === product.id
                      ? "animate-[pulse-scale_0.3s_ease-in-out]"
                      : ""
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setAddingProduct(product.id);
                    addToCart(product, 1);
                    setTimeout(() => setAddingProduct(null), 300);
                  }}
                  data-testid={`button-add-recommendation-${product.id}`}
                >
                  <ShoppingCart className="w-3 h-3 mr-1" />
                  Ekle
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
