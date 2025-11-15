import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useCartContext } from "@/context/CartContext";
import { formatPrice } from "@/lib/authUtils";
import { ShoppingCart, ArrowLeft, Minus, Plus } from "lucide-react";
import { useState } from "react";
import type { Product } from "@shared/schema";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const [, setLocation] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const { addToCart } = useCartContext();
  const { toast } = useToast();
  const productId = params?.id;

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ["/api/products", productId],
    enabled: !!productId,
  });

  if (isLoading) {
    return (
      <div className="pb-20">
        <Skeleton className="h-96 w-full" />
        <div className="px-4 py-6 space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pb-20 px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Ürün bulunamadı</p>
          <Button onClick={() => setLocation("/")} data-testid="button-back-home">
            Ana Sayfaya Dön
          </Button>
        </Card>
      </div>
    );
  }

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-4">
        <Button
          variant="ghost"
          size="sm"
          className="text-primary-foreground hover:bg-primary-foreground/10"
          onClick={() => window.history.back()}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri
        </Button>
      </div>

      {/* Product Image */}
      <div className="aspect-square bg-card flex items-center justify-center">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <ShoppingCart className="w-24 h-24 text-muted-foreground" />
        )}
      </div>

      {/* Product Info */}
      <div className="px-4 py-6 space-y-4">
        <div>
          <h1 className="text-2xl font-bold font-heading mb-2">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-3xl font-bold text-primary">
              {formatPrice(product.priceInCents)}
            </span>
            {product.stock > 0 ? (
              <Badge variant="secondary">Stokta ({product.stock} adet)</Badge>
            ) : (
              <Badge variant="destructive">Tükendi</Badge>
            )}
          </div>
          {product.description && (
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}
        </div>

        {/* Quantity Selector */}
        {product.stock > 0 && (
          <Card className="p-4">
            <label className="text-sm font-medium mb-2 block">Adet</label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={handleDecrement}
                disabled={quantity <= 1}
                data-testid="button-decrement"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <span className="text-xl font-semibold w-12 text-center" data-testid="text-quantity">
                {quantity}
              </span>
              <Button
                variant="outline"
                size="icon"
                onClick={handleIncrement}
                disabled={quantity >= product.stock}
                data-testid="button-increment"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Add to Cart Button */}
        <div className="space-y-2">
          <Button
            size="lg"
            className={`w-full transition-transform ${isAdding ? "animate-[pulse-scale_0.3s_ease-in-out]" : ""}`}
            disabled={product.stock === 0}
            onClick={() => {
              setIsAdding(true);
              addToCart(product, quantity);
              setQuantity(1);
              setTimeout(() => setIsAdding(false), 300);
            }}
            data-testid="button-add-to-cart"
          >
            <ShoppingCart className="w-5 h-5 mr-2" />
            Sepete Ekle
            {quantity > 1 && ` (${quantity} adet)`}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Toplam: {formatPrice(product.priceInCents * quantity)}
          </p>
        </div>
      </div>
    </div>
  );
}
