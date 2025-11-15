import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LucideIcon, ShoppingCart, Package, Tent, Sparkles } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
    testId?: string;
  };
  illustration?: "cart" | "orders" | "category" | "products";
}

const illustrationIcons = {
  cart: ShoppingCart,
  orders: Package,
  category: Tent,
  products: Sparkles,
};

const getIllustration = (type: "cart" | "orders" | "category" | "products") => {
  const Icon = illustrationIcons[type];
  return (
    <div className="relative w-32 h-32 mx-auto mb-6">
      <div className="absolute inset-0 bg-primary/5 rounded-full animate-pulse" />
      <div className="absolute inset-4 bg-primary/10 rounded-full" />
      <div className="absolute inset-8 bg-primary/20 rounded-full flex items-center justify-center">
        <Icon className="w-16 h-16 text-primary/40" />
      </div>
    </div>
  );
};

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  illustration,
}: EmptyStateProps) {
  return (
    <Card className="p-12 text-center">
      {illustration ? (
        getIllustration(illustration)
      ) : Icon ? (
        <Icon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
      ) : null}
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6 max-w-sm mx-auto">{description}</p>
      {action && (
        <Button onClick={action.onClick} data-testid={action.testId}>
          {action.label}
        </Button>
      )}
    </Card>
  );
}
