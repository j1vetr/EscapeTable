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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {activeCategories.map((category) => (
              <div
                key={category.id}
                className="group relative h-[200px] cursor-pointer"
                onClick={() => setLocation(`/categories/${category.id}`)}
                data-testid={`category-card-${category.id}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-3xl transition-all duration-500 group-hover:scale-[1.03] group-hover:shadow-[0_0_50px_rgba(25,39,24,0.7)]"></div>
                <div className="absolute inset-[2px] bg-gradient-to-br from-white/10 to-transparent rounded-3xl backdrop-blur-sm border border-white/20"></div>
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <p className="text-2xl font-black text-white text-center line-clamp-3 drop-shadow-[0_3px_15px_rgba(0,0,0,0.4)]">
                    {category.name}
                  </p>
                </div>
              </div>
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
