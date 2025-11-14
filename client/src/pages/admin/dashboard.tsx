import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPrice } from "@/lib/authUtils";
import {
  ShoppingBag,
  Package,
  TrendingUp,
  Users,
} from "lucide-react";

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  weekOrders: number;
  weekRevenue: number;
  topProducts: Array<{
    productId: string;
    productName: string;
    totalSold: number;
    revenue: number;
  }>;
}

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/admin/dashboard-stats"],
  });

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          İşletme performansınıza genel bakış
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">Bugün</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold" data-testid="text-today-orders">
              {stats?.todayOrders || 0}
            </p>
            <p className="text-xs text-muted-foreground">Sipariş</p>
            <p className="text-sm font-semibold text-primary">
              {formatPrice(stats?.todayRevenue || 0)}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">Bu Hafta</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold" data-testid="text-week-orders">
              {stats?.weekOrders || 0}
            </p>
            <p className="text-xs text-muted-foreground">Sipariş</p>
            <p className="text-sm font-semibold text-primary">
              {formatPrice(stats?.weekRevenue || 0)}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">Toplam</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold" data-testid="text-total-orders">
              {stats?.totalOrders || 0}
            </p>
            <p className="text-xs text-muted-foreground">Sipariş</p>
            <p className="text-sm font-semibold text-primary">
              {formatPrice(stats?.totalRevenue || 0)}
            </p>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs text-muted-foreground">Ortalama</span>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">
              {stats && stats.totalOrders > 0
                ? formatPrice(Math.round(stats.totalRevenue / stats.totalOrders))
                : formatPrice(0)}
            </p>
            <p className="text-xs text-muted-foreground">Sipariş Değeri</p>
          </div>
        </Card>
      </div>

      {/* Top Products */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4 font-heading">En Çok Satan Ürünler</h2>
        {stats && stats.topProducts && stats.topProducts.length > 0 ? (
          <div className="space-y-3">
            {stats.topProducts.map((product, index) => (
              <div
                key={product.productId}
                className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                data-testid={`top-product-${index}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.productName}</p>
                    <p className="text-xs text-muted-foreground">
                      {product.totalSold} adet satıldı
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-primary">
                  {formatPrice(product.revenue)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground py-8">
            Henüz satış verisi yok
          </p>
        )}
      </Card>
    </div>
  );
}
