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
              <Card
                key={category.id}
                className="group relative h-[240px] overflow-hidden cursor-pointer border-0 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 rounded-2xl"
                onClick={() => setLocation(`/categories/${category.id}`)}
                data-testid={`category-card-${category.id}`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-primary/80"></div>
                <div className="absolute inset-0 bg-muted flex items-center justify-center">
                  {category.imageUrl ? (
                    <img
                      src={category.imageUrl}
                      alt={category.name}
                      className="w-full h-full object-cover opacity-30 group-hover:opacity-40 transition-opacity duration-300"
                    />
                  ) : (
                    <ShoppingCart className="w-20 h-20 text-white/30" />
                  )}
                </div>
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <p className="text-2xl font-black text-center text-white drop-shadow-2xl line-clamp-3">
                    {category.name}
                  </p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-card via-white to-card transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
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
