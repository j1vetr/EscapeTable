import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";
import type { Category } from "@shared/schema";

export default function Categories() {
  const [, setLocation] = useLocation();

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const activeCategories = categories?.filter((c) => c.isActive) || [];

  return (
    <div className="pb-20">
      <div className="bg-primary text-primary-foreground px-4 py-6">
        <h1 className="text-2xl font-bold font-heading">Kategoriler</h1>
        <p className="text-sm text-primary-foreground/80 mt-1">
          Ürünlerimizi keşfedin
        </p>
      </div>

      <div className="px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : activeCategories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeCategories.map((category) => (
              <Card
                key={category.id}
                className="p-6 text-center cursor-pointer hover-elevate active-elevate-2"
                onClick={() => setLocation(`/categories/${category.id}`)}
                data-testid={`category-card-${category.id}`}
              >
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                  <ShoppingCart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-1">{category.name}</h3>
                {category.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {category.description}
                  </p>
                )}
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Kategori bulunmuyor</p>
          </Card>
        )}
      </div>
    </div>
  );
}
