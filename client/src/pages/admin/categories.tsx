import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import type { Category } from "@shared/schema";

export default function AdminCategories() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading">Kategoriler</h1>
          <p className="text-muted-foreground mt-1">
            Ürün kategorilerini yönetin
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} data-testid="button-add-category">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Kategori
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Kategori Düzenle" : "Yeni Kategori"}
              </DialogTitle>
            </DialogHeader>
            <CategoryForm
              category={editingCategory}
              onClose={handleCloseDialog}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((category) => (
          <Card key={category.id} className="p-4">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-lg">{category.name}</h3>
              <div className="flex items-center gap-2">
                <Badge variant={category.isActive ? "secondary" : "outline"}>
                  {category.isActive ? "Aktif" : "Pasif"}
                </Badge>
              </div>
            </div>
            {category.description && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {category.description}
              </p>
            )}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleEdit(category)}
                data-testid={`button-edit-${category.id}`}
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

function CategoryForm({
  category,
  onClose,
}: {
  category: Category | null;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [name, setName] = useState(category?.name || "");
  const [description, setDescription] = useState(category?.description || "");
  const [isActive, setIsActive] = useState(category?.isActive ?? true);
  const [sortOrder, setSortOrder] = useState(category?.sortOrder?.toString() || "0");

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/categories", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Kategori oluşturuldu", description: "Kategori başarıyla eklendi" });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Kategori oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/categories/${category?.id}`, {
        method: "PATCH",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Kategori güncellendi", description: "Değişiklikler kaydedildi" });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Kategori güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      description,
      isActive,
      sortOrder: parseInt(sortOrder),
    };

    if (category) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div>
        <Label htmlFor="name">Kategori Adı</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Kategori adı"
          required
          data-testid="input-category-name"
        />
      </div>
      <div>
        <Label htmlFor="description">Açıklama</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Kategori açıklaması (opsiyonel)"
          rows={3}
          data-testid="textarea-category-description"
        />
      </div>
      <div>
        <Label htmlFor="sortOrder">Sıralama</Label>
        <Input
          id="sortOrder"
          type="number"
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          data-testid="input-category-sort"
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="isActive">Aktif</Label>
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={setIsActive}
          data-testid="switch-category-active"
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
          İptal
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isPending}
          data-testid="button-save-category"
        >
          {isPending ? "Kaydediliyor..." : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}
