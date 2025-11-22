import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCartContext } from "@/context/CartContext";
import { formatPrice } from "@/lib/authUtils";
import { Trash2, Plus, Minus, ShoppingBag } from "lucide-react";
import { useLocation } from "wouter";
import EmptyState from "@/components/empty-state";
import ProductRecommendations from "@/components/product-recommendations";
import { useMemo } from "react";

export default function Cart() {
  const [, setLocation] = useLocation();
  const { items: cartItems, totalInCents, updateQuantity, removeFromCart } = useCartContext();

  // Get category IDs and product IDs from cart for recommendations
  const { categoryIds, productIds } = useMemo(() => {
    const categories = new Set<string>();
    const products: string[] = [];
    
    cartItems.forEach((item) => {
      if (item.product.categoryId) {
        categories.add(item.product.categoryId);
      }
      products.push(item.product.id);
    });
    
    return {
      categoryIds: Array.from(categories),
      productIds: products,
    };
  }, [cartItems]);

  if (cartItems.length === 0) {
    return (
      <div className="pb-20">
        <div className="bg-primary text-primary-foreground px-4 py-6">
          <h1 className="text-2xl font-bold font-heading">Sepetim</h1>
        </div>
        
        <div className="px-4 py-8">
          <EmptyState
            icon={ShoppingBag}
            title="Sepetiniz Boş"
            description="Kamp ihtiyaçlarınızı sepete ekleyerek hızlıca sipariş verin"
            illustration="cart"
            action={{
              label: "Alışverişe Başla",
              onClick: () => setLocation("/"),
              testId: "button-start-shopping",
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-48">
      <div className="bg-primary text-primary-foreground px-4 py-6">
        <h1 className="text-2xl font-bold font-heading">Sepetim</h1>
        <p className="text-sm text-primary-foreground/80 mt-1">
          {cartItems.length} ürün
        </p>
      </div>

      <div className="px-4 py-6 space-y-4">
        {cartItems.map((item) => (
          <Card key={item.product.id} className="p-4">
            <div className="flex gap-4">
              <div className="w-20 h-20 bg-muted rounded-md flex items-center justify-center flex-shrink-0">
                {item.product.imageUrl ? (
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="w-full h-full object-cover rounded-md"
                  />
                ) : (
                  <ShoppingBag className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-medium mb-1">{item.product.name}</h3>
                <p className="text-sm text-primary font-semibold">
                  {formatPrice(item.product.priceInCents)}
                </p>
                
                <div className="flex items-center gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    data-testid={`button-decrease-${item.product.id}`}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="text-sm font-medium w-8 text-center" data-testid={`text-quantity-${item.product.id}`}>
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.stock}
                    data-testid={`button-increase-${item.product.id}`}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => removeFromCart(item.product.id)}
                data-testid={`button-remove-${item.product.id}`}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Product Recommendations */}
      {categoryIds.length > 0 && (
        <ProductRecommendations
          categoryIds={categoryIds}
          excludeProductIds={productIds}
          maxItems={6}
        />
      )}

      {/* Sticky Cart Summary */}
      <div className="fixed bottom-16 left-0 right-0 bg-card border-t border-card-border p-4 z-40">
        <div className="container mx-auto max-w-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">Toplam</span>
            <span className="text-2xl font-bold text-primary" data-testid="text-total">
              {formatPrice(totalInCents)}
            </span>
          </div>
          <Button
            size="lg"
            className="w-full"
            onClick={() => setLocation("/checkout")}
            data-testid="button-checkout"
          >
            Siparişi Tamamla
          </Button>
        </div>
      </div>
    </div>
  );
}
