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
              <Skeleton key={i} className="h-48 rounded-lg" />
            ))}
          </div>
        ) : activeCategories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {activeCategories.map((category) => (
              <Card
                key={category.id}
                className="overflow-hidden cursor-pointer hover-elevate active-elevate-2"
                onClick={() => setLocation(`/categories/${category.id}`)}
                data-testid={`category-card-${category.id}`}
              >
                <div className="aspect-square bg-muted flex items-center justify-center">
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ShoppingCart className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
                <div className="p-3 bg-primary">
                  <p className="text-sm font-semibold text-center line-clamp-2 text-primary-foreground">
                    {category.name}
                  </p>
                </div>
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
