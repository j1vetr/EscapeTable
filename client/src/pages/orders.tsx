import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice, getOrderStatusLabel, getOrderStatusColor } from "@/lib/authUtils";
import { Package, Calendar } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import type { Order } from "@shared/schema";

export default function Orders() {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

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
              <Card key={order.id} className="p-4 hover-elevate" data-testid={`order-card-${order.id}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-semibold text-sm">Sipariş #{order.id.slice(0, 8)}</p>
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

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Toplam Tutar</span>
                    <span className="font-semibold text-primary" data-testid={`text-total-${order.id}`}>
                      {formatPrice(order.totalAmountInCents)}
                    </span>
                  </div>
                  
                  {order.estimatedDeliveryTime && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tahmini Teslimat</span>
                      <span className="font-medium">{order.estimatedDeliveryTime}</span>
                    </div>
                  )}

                  {order.customAddress && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-muted-foreground mb-1">Teslimat Adresi</p>
                      <p className="text-xs">{order.customAddress}</p>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Henüz Sipariş Yok</h2>
            <p className="text-muted-foreground">
              Verdiğiniz siparişler burada görünecek
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
