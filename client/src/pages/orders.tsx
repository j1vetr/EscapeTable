import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { formatPrice, getOrderStatusLabel, getOrderStatusColor } from "@/lib/authUtils";
import { Package, Calendar, MapPin, CreditCard, ShoppingBag, RotateCw } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import type { Order, Product } from "@shared/schema";
import EmptyState from "@/components/empty-state";
import { useLocation } from "wouter";
import { useCartContext } from "@/context/CartContext";
import { enhancedToast } from "@/lib/enhanced-toast";
import { useState } from "react";

interface OrderWithDetails extends Order {
  campingLocation?: {
    id: string;
    name: string;
    address?: string | null;
  } | null;
  items?: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    productPriceInCents: number;
    subtotalInCents: number;
  }>;
}

export default function Orders() {
  const [, setLocation] = useLocation();
  const { addToCart } = useCartContext();
  const [reorderingId, setReorderingId] = useState<string | null>(null);
  
  const { data: orders, isLoading } = useQuery<OrderWithDetails[]>({
    queryKey: ["/api/orders"],
  });

  // Fetch all products to check stock before reordering
  const { data: allProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const handleReorder = async (order: OrderWithDetails) => {
    if (!order.items || !allProducts) return;
    
    setReorderingId(order.id);
    
    let addedCount = 0;
    let outOfStockItems: string[] = [];
    
    // Check each item and add to cart if in stock
    for (const item of order.items) {
      const currentProduct = allProducts.find((p) => p.id === item.productId);
      
      if (currentProduct && currentProduct.isActive && currentProduct.stock >= item.quantity) {
        addToCart(currentProduct, item.quantity);
        addedCount++;
      } else if (currentProduct && currentProduct.stock === 0) {
        outOfStockItems.push(item.productName);
      }
    }
    
    setTimeout(() => {
      setReorderingId(null);
      
      if (addedCount > 0) {
        enhancedToast({
          title: "Ürünler sepete eklendi",
          description: `${addedCount} ürün sepetinize eklendi${
            outOfStockItems.length > 0
              ? `. ${outOfStockItems.length} ürün stokta yok`
              : ""
          }`,
          type: "success",
        });
        
        if (outOfStockItems.length === 0) {
          setLocation("/cart");
        }
      } else {
        enhancedToast({
          title: "Ürünler stokta yok",
          description: "Siparişinizdeki ürünler şu an stokta bulunmuyor",
          type: "warning",
        });
      }
    }, 500);
  };

  return (
    <div className="pb-20">
      <div className="bg-primary text-primary-foreground px-4 py-6">
        <h1 className="text-2xl font-bold font-heading">Siparişlerim</h1>
        <p className="text-sm text-primary-foreground/80 mt-1">
          Sipariş geçmişiniz ve durumu
        </p>
      </div>

      <div className="px-4 py-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-5 hover-elevate" data-testid={`order-card-${order.id}`}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold">Sipariş #{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <Calendar className="w-3 h-3" />
                        {format(new Date(order.createdAt), "d MMMM yyyy, HH:mm", { locale: tr })}
                      </p>
                    </div>
                  </div>
                  <Badge className={getOrderStatusColor(order.status)} data-testid={`badge-status-${order.id}`}>
                    {getOrderStatusLabel(order.status)}
                  </Badge>
                </div>

                {/* Camping Location */}
                {order.campingLocation && (
                  <div className="flex items-start gap-2 mb-3">
                    <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium">{order.campingLocation.name}</p>
                      {order.campingLocation.address && (
                        <p className="text-xs text-muted-foreground mt-0.5">{order.campingLocation.address}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Custom Address Note */}
                {order.customAddress && (
                  <div className="flex items-start gap-2 mb-3 bg-muted/30 p-2 rounded-md">
                    <Package className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">Teslimat Notu</p>
                      <p className="text-xs">{order.customAddress}</p>
                    </div>
                  </div>
                )}

                <Separator className="my-3" />

                {/* Order Items */}
                {order.items && order.items.length > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <ShoppingBag className="w-4 h-4 text-primary" />
                      <p className="text-xs font-semibold text-muted-foreground">Ürünler</p>
                    </div>
                    <div className="space-y-1.5">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-sm">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                              {item.quantity}x
                            </Badge>
                            <span className="text-sm">{item.productName}</span>
                          </div>
                          <span className="font-medium text-sm">{formatPrice(item.subtotalInCents)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Separator className="my-3" />

                {/* Summary */}
                <div className="space-y-2 text-sm">
                  {order.estimatedDeliveryTime && (
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-xs">Tahmini Teslimat</span>
                      <span className="font-medium text-xs">{order.estimatedDeliveryTime}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground text-xs">Ödeme Yöntemi</span>
                    </div>
                    <span className="font-medium text-xs">
                      {order.paymentMethod === "cash" ? "Nakit" : "Havale/EFT"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                    <span className="font-semibold">Toplam Tutar</span>
                    <span className="text-lg font-bold text-primary" data-testid={`text-total-${order.id}`}>
                      {formatPrice(order.totalAmountInCents)}
                    </span>
                  </div>
                </div>

                {/* Reorder Button */}
                <Separator className="my-3" />
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handleReorder(order)}
                  disabled={reorderingId === order.id}
                  data-testid={`button-reorder-${order.id}`}
                >
                  <RotateCw
                    className={`w-4 h-4 mr-2 ${
                      reorderingId === order.id ? "animate-spin" : ""
                    }`}
                  />
                  {reorderingId === order.id ? "Sepete Ekleniyor..." : "Tekrar Sipariş Ver"}
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Package}
            title="Henüz Sipariş Yok"
            description="Kamp keyfinizi eksiksiz yaşamak için ilk siparişinizi verin"
            illustration="orders"
            action={{
              label: "Alışverişe Başla",
              onClick: () => setLocation("/"),
              testId: "button-start-shopping-orders",
            }}
          />
        )}
      </div>
    </div>
  );
}
