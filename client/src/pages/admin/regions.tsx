import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit } from "lucide-react";
import type { DeliveryRegion } from "@shared/schema";

export default function AdminRegions() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<DeliveryRegion | null>(null);

  const { data: regions, isLoading } = useQuery<DeliveryRegion[]>({
    queryKey: ["/api/delivery-regions"],
  });

  const handleEdit = (region: DeliveryRegion) => {
    setEditingRegion(region);
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingRegion(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingRegion(null);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading">Teslimat Bölgeleri</h1>
          <p className="text-muted-foreground mt-1">
            Teslimat bölgelerini yönetin
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} data-testid="button-add-region">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Bölge
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingRegion ? "Bölge Düzenle" : "Yeni Bölge"}
              </DialogTitle>
            </DialogHeader>
            <RegionForm region={editingRegion} onClose={handleCloseDialog} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regions?.map((region) => (
          <Card key={region.id} className="p-6">
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-semibold">{region.name}</h3>
              <Badge variant={region.isActive ? "secondary" : "outline"}>
                {region.isActive ? "Aktif" : "Pasif"}
              </Badge>
            </div>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Min. Teslimat</span>
                <span className="font-medium">{region.minEtaMinutes} dk</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Max. Teslimat</span>
                <span className="font-medium">{region.maxEtaMinutes} dk</span>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => handleEdit(region)}
              data-testid={`button-edit-${region.id}`}
            >
              <Edit className="w-4 h-4 mr-1" />
              Düzenle
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function RegionForm({
  region,
  onClose,
}: {
  region: DeliveryRegion | null;
  onClose: () => void;
}) {
  const [name, setName] = useState(region?.name || "");
  const [minEta, setMinEta] = useState(region?.minEtaMinutes?.toString() || "30");
  const [maxEta, setMaxEta] = useState(region?.maxEtaMinutes?.toString() || "120");
  const [isActive, setIsActive] = useState(region?.isActive ?? true);

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div>
        <Label htmlFor="name">Bölge Adı</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Örn: Fethiye"
          data-testid="input-region-name"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minEta">Min. ETA (dk)</Label>
          <Input
            id="minEta"
            type="number"
            value={minEta}
            onChange={(e) => setMinEta(e.target.value)}
            data-testid="input-region-min-eta"
          />
        </div>
        <div>
          <Label htmlFor="maxEta">Max. ETA (dk)</Label>
          <Input
            id="maxEta"
            type="number"
            value={maxEta}
            onChange={(e) => setMaxEta(e.target.value)}
            data-testid="input-region-max-eta"
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="isActive">Aktif</Label>
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={setIsActive}
          data-testid="switch-region-active"
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          İptal
        </Button>
        <Button type="submit" className="flex-1" data-testid="button-save-region">
          Kaydet
        </Button>
      </div>
    </form>
  );
}
