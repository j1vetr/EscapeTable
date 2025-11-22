import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useCartContext } from "@/context/CartContext";
import { formatPrice } from "@/lib/authUtils";
import { ShoppingCart, ArrowLeft, Minus, Plus, ZoomIn, X } from "lucide-react";
import { useState } from "react";
import type { Product } from "@shared/schema";

export default function ProductDetail() {
  const [, params] = useRoute("/products/:id");
  const [, setLocation] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [isImageZoomed, setIsImageZoomed] = useState(false);
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
      <div className="relative aspect-square bg-card flex items-center justify-center group cursor-pointer"
        onClick={() => product.imageUrl && setIsImageZoomed(true)}
        data-testid="image-product-main"
      >
        {product.imageUrl ? (
          <>
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {/* Zoom Indicator */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded-full p-3">
                <ZoomIn className="w-8 h-8 text-white" />
              </div>
            </div>
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              Büyütmek için tıklayın
            </div>
          </>
        ) : (
          <ShoppingCart className="w-24 h-24 text-muted-foreground" />
        )}
      </div>

      {/* Image Zoom Modal */}
      <Dialog open={isImageZoomed} onOpenChange={setIsImageZoomed}>
        <DialogContent className="max-w-4xl w-full p-0 bg-black/95 border-0">
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 text-white hover:bg-white/20 rounded-full"
              onClick={() => setIsImageZoomed(false)}
              data-testid="button-close-zoom"
            >
              <X className="w-6 h-6" />
            </Button>
            {product.imageUrl && (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-auto max-h-[90vh] object-contain"
                data-testid="image-zoomed"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <h3 className="text-white font-semibold text-lg">{product.name}</h3>
              <p className="text-white/80 text-sm">{formatPrice(product.priceInCents)}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
