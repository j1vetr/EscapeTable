import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  List,
  ShoppingBag,
  Package,
  MapPin,
  Tent,
  Clock,
  Settings,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  testId: string;
}

const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard className="w-5 h-5" />,
    testId: "nav-admin-dashboard",
  },
  {
    label: "Kategoriler",
    href: "/admin/categories",
    icon: <List className="w-5 h-5" />,
    testId: "nav-admin-categories",
  },
  {
    label: "Ürünler",
    href: "/admin/products",
    icon: <ShoppingBag className="w-5 h-5" />,
    testId: "nav-admin-products",
  },
  {
    label: "Siparişler",
    href: "/admin/orders",
    icon: <Package className="w-5 h-5" />,
    testId: "nav-admin-orders",
  },
  {
    label: "Teslimat Bölgeleri",
    href: "/admin/regions",
    icon: <MapPin className="w-5 h-5" />,
    testId: "nav-admin-regions",
  },
  {
    label: "Kamp Lokasyonları",
    href: "/admin/locations",
    icon: <Tent className="w-5 h-5" />,
    testId: "nav-admin-locations",
  },
  {
    label: "Teslimat Saatleri",
    href: "/admin/slots",
    icon: <Clock className="w-5 h-5" />,
    testId: "nav-admin-slots",
  },
  {
    label: "Ayarlar",
    href: "/admin/settings",
    icon: <Settings className="w-5 h-5" />,
    testId: "nav-admin-settings",
  },
];

export function AdminSidebar() {
  const [location, setLocation] = useLocation();

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex-shrink-0 hidden md:flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-primary font-heading">EscapeTable</h1>
        <p className="text-xs text-muted-foreground mt-1">Yönetim Paneli</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <button
                data-testid={item.testId}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium hover-elevate active-elevate-2",
                  isActive
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground"
                )}
              >
                {item.icon}
                {item.label}
              </button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setLocation("/")}
          data-testid="button-back-to-store"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Mağazaya Dön
        </Button>
      </div>
    </aside>
  );
}
