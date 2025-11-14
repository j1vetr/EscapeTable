import { Link, useLocation } from "wouter";
import { Home, List, ShoppingCart, Package, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useCartContext } from "@/context/CartContext";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  testId: string;
}

const navItems: NavItem[] = [
  {
    label: "Ana Sayfa",
    href: "/",
    icon: <Home className="w-5 h-5" />,
    testId: "nav-home",
  },
  {
    label: "Kategoriler",
    href: "/categories",
    icon: <List className="w-5 h-5" />,
    testId: "nav-categories",
  },
  {
    label: "Sepet",
    href: "/cart",
    icon: <ShoppingCart className="w-5 h-5" />,
    testId: "nav-cart",
  },
  {
    label: "Siparişlerim",
    href: "/orders",
    icon: <Package className="w-5 h-5" />,
    testId: "nav-orders",
  },
  {
    label: "Hesabım",
    href: "/account",
    icon: <User className="w-5 h-5" />,
    testId: "nav-account",
  },
];

export function MobileNav() {
  const [location] = useLocation();
  const { totalItems } = useCartContext();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-card-border z-50 safe-area-bottom">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const isActive = location === item.href;
          const isCart = item.href === "/cart";
          return (
            <Link
              key={item.href}
              href={item.href}
              data-testid={item.testId}
            >
              <button
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full gap-1 hover-elevate active-elevate-2 relative",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                <div className="relative">
                  {item.icon}
                  {isCart && totalItems > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {totalItems > 9 ? "9+" : totalItems}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
