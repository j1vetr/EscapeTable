import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { formatPrice } from "@/lib/authUtils";
import { ShoppingCart, ArrowLeft, SlidersHorizontal, X, Search } from "lucide-react";
import type { Category, Product } from "@shared/schema";
import { useState, useMemo, useEffect } from "react";
import { useCartContext } from "@/context/CartContext";

type SortOption = "price-asc" | "price-desc" | "name-asc" | "name-desc";

export default function CategoryDetail() {
  const [, params] = useRoute("/categories/:id");
  const [, setLocation] = useLocation();
  const { addToCart } = useCartContext();
  const categoryId = params?.id;

  // Filter states (prices in cents)
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("name-asc");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const { data: category, isLoading: categoryLoading } = useQuery<Category>({
    queryKey: ["/api/categories", categoryId as string],
    enabled: !!categoryId,
  });

  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: [`/api/products?categoryId=${categoryId}`],
    enabled: !!categoryId,
  });

  const activeProducts = products?.filter((p) => p.isActive) || [];

  // Calculate min and max prices for slider (in cents)
  const priceStats = useMemo(() => {
    if (!activeProducts.length) return { min: 0, max: 100000 };
    const prices = activeProducts.map((p) => p.priceInCents);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [activeProducts]);

  // Initialize price range when data loads
  useEffect(() => {
    if (!isInitialized && activeProducts.length > 0) {
      setPriceRange([priceStats.min, priceStats.max]);
      setIsInitialized(true);
    }
  }, [priceStats, activeProducts.length, isInitialized]);

  // Apply filters and sorting
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...activeProducts];

    // Apply price filter (already in cents)
    result = result.filter(
      (p) => p.priceInCents >= priceRange[0] && p.priceInCents <= priceRange[1]
    );

    // Apply stock filter
    if (onlyInStock) {
      result = result.filter((p) => p.stock > 0);
    }

    // Apply sorting (clone to avoid mutation)
    const sorted = [...result];
    switch (sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.priceInCents - b.priceInCents);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.priceInCents - a.priceInCents);
        break;
      case "name-asc":
        sorted.sort((a, b) => a.name.localeCompare(b.name, "tr"));
        break;
      case "name-desc":
        sorted.sort((a, b) => b.name.localeCompare(a.name, "tr"));
        break;
    }

    return sorted;
  }, [activeProducts, priceRange, onlyInStock, sortBy]);

  const hasActiveFilters = onlyInStock || priceRange[0] !== priceStats.min || priceRange[1] !== priceStats.max;

  const clearFilters = () => {
    setPriceRange([priceStats.min, priceStats.max]);
    setOnlyInStock(false);
    setSortBy("name-asc");
  };

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Sort */}
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Sıralama</Label>
        <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
          <SelectTrigger data-testid="select-sort">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name-asc">İsim (A-Z)</SelectItem>
            <SelectItem value="name-desc">İsim (Z-A)</SelectItem>
            <SelectItem value="price-asc">Fiyat (Düşük-Yüksek)</SelectItem>
            <SelectItem value="price-desc">Fiyat (Yüksek-Düşük)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Price Range */}
      <div className="space-y-3">
        <Label className="text-sm font-semibold">Fiyat Aralığı</Label>
        <div className="px-2">
          <Slider
            min={priceStats.min}
            max={priceStats.max}
            step={100}
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            data-testid="slider-price-range"
            className="mb-4"
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <div className="px-3 py-1.5 bg-muted rounded-md">
            <span className="text-muted-foreground">Min: </span>
            <span className="font-semibold">{formatPrice(priceRange[0])}</span>
          </div>
          <div className="px-3 py-1.5 bg-muted rounded-md">
            <span className="text-muted-foreground">Max: </span>
            <span className="font-semibold">{formatPrice(priceRange[1])}</span>
          </div>
        </div>
      </div>

      {/* Stock Filter */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="only-in-stock"
          checked={onlyInStock}
          onCheckedChange={(checked) => setOnlyInStock(checked as boolean)}
          data-testid="checkbox-in-stock"
        />
        <Label htmlFor="only-in-stock" className="text-sm cursor-pointer">
          Sadece stokta olanları göster
        </Label>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="outline"
          size="sm"
          onClick={clearFilters}
          className="w-full"
          data-testid="button-clear-filters"
        >
          <X className="w-4 h-4 mr-2" />
          Filtreleri Temizle
        </Button>
      )}

      {/* Results Count */}
      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{filteredAndSortedProducts.length}</span> ürün bulundu
        </p>
      </div>
    </div>
  );

  if (categoryLoading) {
    return (
      <div className="pb-20">
        <Skeleton className="h-32 w-full" />
        <div className="px-4 py-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-64 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!category) {
    return (
      <div className="pb-20 px-4 py-8">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground mb-4">Kategori bulunamadı</p>
          <Button onClick={() => setLocation("/categories")} data-testid="button-back-categories">
            Kategorilere Dön
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-3 text-primary-foreground hover:bg-primary-foreground/10"
          onClick={() => setLocation("/categories")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri
        </Button>
        <h1 className="text-2xl font-bold font-heading">{category.name}</h1>
        {category.description && (
          <p className="text-sm text-primary-foreground/80 mt-1">
            {category.description}
          </p>
        )}
      </div>

      <div className="flex gap-6">
        {/* Desktop Filters Sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0 px-4 py-6">
          <Card className="p-4 sticky top-4">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5" />
              Filtreler
            </h2>
            <FilterContent />
          </Card>
        </div>

        {/* Products Grid */}
        <div className="flex-1 px-4 py-6">
          {/* Mobile Filter Button & Sort */}
          <div className="md:hidden flex items-center gap-2 mb-4">
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex-1" data-testid="button-open-filters">
                  <SlidersHorizontal className="w-4 h-4 mr-2" />
                  Filtreler
                  {hasActiveFilters && (
                    <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-xs">
                      !
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="h-[85vh]">
                <SheetHeader>
                  <SheetTitle>Filtreler</SheetTitle>
                  <SheetDescription>
                    Ürünleri filtreleyip sıralayın
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 overflow-y-auto max-h-[calc(85vh-120px)]">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Products */}
          {productsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64 rounded-lg" />
              ))}
            </div>
          ) : filteredAndSortedProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
              {filteredAndSortedProducts.map((product) => (
                <Card
                  key={product.id}
                  className="group overflow-hidden cursor-pointer border-2 border-border bg-card transition-all duration-300 hover:shadow-lg hover:border-primary"
                  onClick={() => setLocation(`/products/${product.id}`)}
                  data-testid={`product-card-${product.id}`}
                >
                  <div className="aspect-[3/4] overflow-hidden relative bg-muted">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="w-16 h-16 text-muted-foreground/30" />
                      </div>
                    )}
                    {product.stock > 0 ? (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-primary rounded text-[10px] font-semibold text-white">
                        Stokta
                      </div>
                    ) : (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-destructive rounded text-[10px] font-semibold text-white">
                        Tükendi
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <h3 className="font-bold text-sm line-clamp-2 min-h-[2.5rem]">
                      {product.name}
                    </h3>
                    {product.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 min-h-[2rem]">
                        {product.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        {formatPrice(product.priceInCents)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold text-xs h-8"
                        disabled={product.stock === 0}
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product, 1);
                        }}
                        data-testid={`button-add-to-cart-${product.id}`}
                      >
                        <ShoppingCart className="w-3.5 h-3.5 mr-1.5" />
                        Sepete Ekle
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8 flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/products/${product.id}`);
                        }}
                        data-testid={`button-view-product-${product.id}`}
                      >
                        <Search className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters
                  ? "Filtrelere uygun ürün bulunamadı"
                  : "Bu kategoride ürün bulunmuyor"}
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline" data-testid="button-clear-filters-empty">
                  Filtreleri Temizle
                </Button>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
