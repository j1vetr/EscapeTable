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
import { Plus, Edit, MapPin } from "lucide-react";
import type { CampingLocation, DeliveryRegion } from "@shared/schema";

export default function AdminLocations() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<CampingLocation | null>(null);

  const { data: locations, isLoading } = useQuery<CampingLocation[]>({
    queryKey: ["/api/camping-locations"],
  });

  const { data: regions } = useQuery<DeliveryRegion[]>({
    queryKey: ["/api/delivery-regions"],
  });

  const handleEdit = (location: CampingLocation) => {
    setEditingLocation(location);
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingLocation(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingLocation(null);
  };

  const getRegionName = (regionId: string) => {
    return regions?.find((r) => r.id === regionId)?.name || "Bilinmiyor";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading">Kamp Lokasyonları</h1>
          <p className="text-muted-foreground mt-1">
            Kamp alanlarını yönetin
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} data-testid="button-add-location">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Lokasyon
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? "Lokasyon Düzenle" : "Yeni Lokasyon"}
              </DialogTitle>
            </DialogHeader>
            <LocationForm
              location={editingLocation}
              regions={regions || []}
              onClose={handleCloseDialog}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {locations?.map((location) => (
          <Card key={location.id} className="p-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold mb-1">{location.name}</h3>
                <Badge variant="outline" className="text-xs">
                  {getRegionName(location.regionId)}
                </Badge>
              </div>
              <Badge variant={location.isActive ? "secondary" : "outline"}>
                {location.isActive ? "Aktif" : "Pasif"}
              </Badge>
            </div>
            {location.address && (
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {location.address}
              </p>
            )}
            <Button
              size="sm"
              variant="outline"
              className="w-full"
              onClick={() => handleEdit(location)}
              data-testid={`button-edit-${location.id}`}
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

function LocationForm({
  location,
  regions,
  onClose,
}: {
  location: CampingLocation | null;
  regions: DeliveryRegion[];
  onClose: () => void;
}) {
  const [name, setName] = useState(location?.name || "");
  const [regionId, setRegionId] = useState(location?.regionId || "");
  const [address, setAddress] = useState(location?.address || "");
  const [isActive, setIsActive] = useState(location?.isActive ?? true);

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div>
        <Label htmlFor="name">Lokasyon Adı</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Kamp alanı adı"
          data-testid="input-location-name"
        />
      </div>
      <div>
        <Label htmlFor="region">Bölge</Label>
        <Select value={regionId} onValueChange={setRegionId}>
          <SelectTrigger data-testid="select-location-region">
            <SelectValue placeholder="Bölge seçin" />
          </SelectTrigger>
          <SelectContent>
            {regions.map((region) => (
              <SelectItem key={region.id} value={region.id}>
                {region.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="address">Adres (opsiyonel)</Label>
        <Textarea
          id="address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Detaylı adres bilgisi"
          rows={3}
          data-testid="textarea-location-address"
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="isActive">Aktif</Label>
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={setIsActive}
          data-testid="switch-location-active"
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          İptal
        </Button>
        <Button type="submit" className="flex-1" data-testid="button-save-location">
          Kaydet
        </Button>
      </div>
    </form>
  );
}
