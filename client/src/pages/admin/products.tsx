import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/authUtils";
import type { Product, Category } from "@shared/schema";

export default function AdminProducts() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingProduct(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading">Ürünler</h1>
          <p className="text-muted-foreground mt-1">
            Ürünlerinizi yönetin
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} data-testid="button-add-product">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Ürün
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingProduct ? "Ürün Düzenle" : "Yeni Ürün"}
              </DialogTitle>
            </DialogHeader>
            <ProductForm
              product={editingProduct}
              categories={categories || []}
              onClose={handleCloseDialog}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products?.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-square bg-muted flex items-center justify-center">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <ShoppingBag className="w-12 h-12 text-muted-foreground" />
              )}
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-semibold line-clamp-1">{product.name}</h3>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-primary">
                  {formatPrice(product.priceInCents)}
                </span>
                <Badge variant="outline" className="text-xs">
                  Stok: {product.stock}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {product.isActive && (
                  <Badge variant="secondary" className="text-xs">Aktif</Badge>
                )}
                {product.isFeatured && (
                  <Badge variant="default" className="text-xs">Öne Çıkan</Badge>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                onClick={() => handleEdit(product)}
                data-testid={`button-edit-${product.id}`}
              >
                <Edit className="w-4 h-4 mr-1" />
                Düzenle
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ProductForm({
  product,
  categories,
  onClose,
}: {
  product: Product | null;
  categories: Category[];
  onClose: () => void;
}) {
  const [name, setName] = useState(product?.name || "");
  const [description, setDescription] = useState(product?.description || "");
  const [categoryId, setCategoryId] = useState(product?.categoryId || "");
  const [price, setPrice] = useState(
    product ? (product.priceInCents / 100).toString() : ""
  );
  const [stock, setStock] = useState(product?.stock?.toString() || "0");
  const [imageUrl, setImageUrl] = useState(product?.imageUrl || "");
  const [isActive, setIsActive] = useState(product?.isActive ?? true);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);

  return (
    <form className="space-y-4 max-h-[70vh] overflow-y-auto px-1" onSubmit={(e) => e.preventDefault()}>
      <div>
        <Label htmlFor="name">Ürün Adı</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ürün adı"
          data-testid="input-product-name"
        />
      </div>
      <div>
        <Label htmlFor="description">Açıklama</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ürün açıklaması"
          rows={3}
          data-testid="textarea-product-description"
        />
      </div>
      <div>
        <Label htmlFor="category">Kategori</Label>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger data-testid="select-product-category">
            <SelectValue placeholder="Kategori seçin" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Fiyat (TL)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="0.00"
            data-testid="input-product-price"
          />
        </div>
        <div>
          <Label htmlFor="stock">Stok</Label>
          <Input
            id="stock"
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            data-testid="input-product-stock"
          />
        </div>
      </div>
      <div>
        <Label htmlFor="imageUrl">Görsel URL</Label>
        <Input
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://..."
          data-testid="input-product-image"
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="isActive">Aktif</Label>
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={setIsActive}
          data-testid="switch-product-active"
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="isFeatured">Öne Çıkan</Label>
        <Switch
          id="isFeatured"
          checked={isFeatured}
          onCheckedChange={setIsFeatured}
          data-testid="switch-product-featured"
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          İptal
        </Button>
        <Button
          type="submit"
          className="flex-1"
          data-testid="button-save-product"
        >
          Kaydet
        </Button>
      </div>
    </form>
  );
}
