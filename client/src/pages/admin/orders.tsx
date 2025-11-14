import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice, getOrderStatusLabel, getOrderStatusColor } from "@/lib/authUtils";
import { Package, User, MapPin, Calendar } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import type { Order } from "@shared/schema";

export default function AdminOrders() {
  const { data: orders, isLoading } = useQuery<Order[]>({
    queryKey: ["/api/admin/orders"],
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    // Status update logic will be implemented in integration phase
    console.log(`Update order ${orderId} to ${newStatus}`);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">Siparişler</h1>
        <p className="text-muted-foreground mt-1">
          Tüm siparişleri görüntüleyin ve yönetin
        </p>
      </div>

      <div className="space-y-4">
        {orders?.map((order) => (
          <Card key={order.id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Package className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold" data-testid={`text-order-id-${order.id}`}>
                    Sipariş #{order.id.slice(0, 8)}
                  </h3>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(order.createdAt), "d MMMM yyyy, HH:mm", { locale: tr })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-primary">
                  {formatPrice(order.totalAmountInCents)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {order.paymentMethod === 'cash' ? 'Nakit' : 'Havale'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <p className="text-muted-foreground">Müşteri</p>
                    <p className="font-medium">Kullanıcı #{order.userId.slice(0, 8)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    <p className="text-muted-foreground">Teslimat</p>
                    <p className="font-medium">{order.customAddress || "Kamp alanı"}</p>
                    {order.estimatedDeliveryTime && (
                      <p className="text-xs text-muted-foreground">
                        Tahmini: {order.estimatedDeliveryTime}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Sipariş Durumu</p>
                  <Select
                    value={order.status}
                    onValueChange={(value) => handleStatusChange(order.id, value)}
                  >
                    <SelectTrigger data-testid={`select-status-${order.id}`}>
                      <SelectValue>
                        <Badge className={getOrderStatusColor(order.status)}>
                          {getOrderStatusLabel(order.status)}
                        </Badge>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preparing">Hazırlanıyor</SelectItem>
                      <SelectItem value="on_delivery">Yolda</SelectItem>
                      <SelectItem value="delivered">Teslim Edildi</SelectItem>
                      <SelectItem value="cancelled">İptal Edildi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
