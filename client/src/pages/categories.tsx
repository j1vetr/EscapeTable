import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ShoppingCart } from "lucide-react";
import { useLocation } from "wouter";
import type { Category } from "@shared/schema";
import EmptyState from "@/components/empty-state";

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
                className="group relative h-[140px] overflow-hidden cursor-pointer border-2 border-primary transition-all duration-300 hover:shadow-lg"
                onClick={() => setLocation(`/categories/${category.id}`)}
                data-testid={`category-card-${category.id}`}
              >
                {category.imageUrl && (
                  <div className="absolute inset-0">
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-primary/60"></div>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  <p className="text-base font-bold text-white text-center line-clamp-2">
                    {category.name}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ShoppingCart}
            title="Kategori Bulunmuyor"
            description="Yakında yeni kategoriler eklenecek"
            illustration="category"
          />
        )}
      </div>
    </div>
  );
}
