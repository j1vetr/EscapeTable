import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/authUtils";
import {
  CheckCircle2,
  Package,
  Calendar,
  MapPin,
  CreditCard,
  ShoppingBag,
  Home,
  Copy,
  Check,
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import type { Order } from "@shared/schema";
import { useState } from "react";

interface OrderWithDetails extends Order {
  campingLocation?: {
    id: string;
    name: string;
    address?: string | null;
  } | null;
  items?: Array<{
    id: string;
    productName: string;
    quantity: number;
    productPriceInCents: number;
    subtotalInCents: number;
  }>;
}

export default function OrderSuccess() {
  const [, params] = useRoute("/order-success/:orderId");
  const [, setLocation] = useLocation();
  const [copied, setCopied] = useState(false);
  const orderId = params?.orderId;

  const { data: order, isLoading } = useQuery<OrderWithDetails>({
    queryKey: ["/api/orders", orderId],
    enabled: !!orderId,
  });

  const copyOrderId = () => {
    if (orderId) {
      navigator.clipboard.writeText(orderId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isLoading || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-primary/5 pb-20">
      {/* Success Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-500 text-white px-4 py-12">
        <div className="max-w-2xl mx-auto text-center space-y-4">
          <div className="w-24 h-24 mx-auto bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-[pulse-scale_1s_ease-in-out]">
            <CheckCircle2 className="w-16 h-16" />
          </div>
          <h1 className="text-3xl font-bold font-heading">Siparişiniz Alındı!</h1>
          <p className="text-green-50 text-lg">
            Teşekkür ederiz! Siparişiniz başarıyla oluşturuldu.
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-8">
        {/* Order ID Card */}
        <Card className="p-6 mb-6 border-2 border-primary/20 shadow-lg">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">Sipariş Numaranız</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-2xl font-mono font-bold text-primary bg-primary/5 px-4 py-2 rounded-md">
                #{order.id.slice(0, 8).toUpperCase()}
              </code>
              <Button
                size="icon"
                variant="ghost"
                onClick={copyOrderId}
                data-testid="button-copy-order-id"
                className="h-10 w-10"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Bu numarayı sipariş takibi için saklayın
            </p>
          </div>
        </Card>

        {/* Order Timeline */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold mb-6 flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Sipariş Durumu
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Sipariş Alındı</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(order.createdAt), "d MMMM yyyy, HH:mm", { locale: tr })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 opacity-50">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <Package className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Hazırlanıyor</p>
                <p className="text-xs text-muted-foreground">Yakında başlayacak</p>
              </div>
            </div>

            <div className="flex items-center gap-4 opacity-30">
              <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="w-6 h-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Teslim Edilecek</p>
                <p className="text-xs text-muted-foreground">
                  {order.estimatedDeliveryTime || "Yakında"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Delivery Info */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Teslimat Bilgileri
          </h2>
          
          {order.campingLocation && (
            <div className="space-y-2">
              <p className="font-medium">{order.campingLocation.name}</p>
              {order.campingLocation.address && (
                <p className="text-sm text-muted-foreground">{order.campingLocation.address}</p>
              )}
            </div>
          )}

          {order.customAddress && (
            <div className="mt-3 bg-muted/30 p-3 rounded-md">
              <p className="text-xs font-medium text-muted-foreground mb-1">Teslimat Notu</p>
              <p className="text-sm">{order.customAddress}</p>
            </div>
          )}

          <Separator className="my-4" />

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-primary" />
            <p className="font-medium">Tahmini Teslimat: </p>
            <p className="text-muted-foreground">{order.estimatedDeliveryTime}</p>
          </div>
        </Card>

        {/* Order Items */}
        {order.items && order.items.length > 0 && (
          <Card className="p-6 mb-6">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              Sipariş Detayları
            </h2>
            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs px-2">
                      {item.quantity}x
                    </Badge>
                    <span className="text-sm">{item.productName}</span>
                  </div>
                  <span className="font-medium text-sm">{formatPrice(item.subtotalInCents)}</span>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Ara Toplam</span>
                <span>{formatPrice(order.totalAmountInCents)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Teslimat</span>
                <Badge variant="secondary">Ücretsiz</Badge>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-semibold">Toplam</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(order.totalAmountInCents)}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Payment Info */}
        <Card className="p-6 mb-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-primary" />
            Ödeme Bilgileri
          </h2>
          <p className="text-sm">
            <span className="text-muted-foreground">Ödeme Yöntemi: </span>
            <span className="font-medium">
              {order.paymentMethod === "cash" ? "Nakit (Teslimat Sırasında)" : "Banka Havalesi / EFT"}
            </span>
          </p>
          {order.paymentMethod === "bank_transfer" && (
            <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 rounded-md">
              <p className="text-xs text-yellow-800 dark:text-yellow-200">
                Lütfen ödemenizi en kısa sürede yapınız. Sipariş numaranızı açıklama kısmına yazmayı unutmayın.
              </p>
            </div>
          )}
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            size="lg"
            className="w-full"
            onClick={() => setLocation("/orders")}
            data-testid="button-view-orders"
          >
            <Package className="w-5 h-5 mr-2" />
            Siparişlerimi Görüntüle
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="w-full"
            onClick={() => setLocation("/")}
            data-testid="button-home"
          >
            <Home className="w-5 h-5 mr-2" />
            Ana Sayfaya Dön
          </Button>
        </div>

        <div className="mt-8 p-4 bg-muted/30 rounded-lg text-center">
          <p className="text-sm text-muted-foreground">
            Sorularınız için bizimle iletişime geçebilirsiniz. 🏕️
          </p>
        </div>
      </div>
    </div>
  );
}
