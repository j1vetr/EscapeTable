import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Plus, Edit, Clock } from "lucide-react";
import type { DeliverySlot, DeliveryRegion } from "@shared/schema";

export default function AdminSlots() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<DeliverySlot | null>(null);

  const { data: slots, isLoading } = useQuery<DeliverySlot[]>({
    queryKey: ["/api/delivery-slots"],
  });

  const { data: regions } = useQuery<DeliveryRegion[]>({
    queryKey: ["/api/delivery-regions"],
  });

  const handleEdit = (slot: DeliverySlot) => {
    setEditingSlot(slot);
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setEditingSlot(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingSlot(null);
  };

  const getRegionName = (regionId: string) => {
    return regions?.find((r) => r.id === regionId)?.name || "Bilinmiyor";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-heading">Teslimat Saatleri</h1>
          <p className="text-muted-foreground mt-1">
            Teslimat zaman dilimlerini yönetin
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNew} data-testid="button-add-slot">
              <Plus className="w-4 h-4 mr-2" />
              Yeni Slot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingSlot ? "Slot Düzenle" : "Yeni Slot"}
              </DialogTitle>
            </DialogHeader>
            <SlotForm
              slot={editingSlot}
              regions={regions || []}
              onClose={handleCloseDialog}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {slots?.map((slot) => (
          <Card key={slot.id} className="p-6">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-lg">
                    {slot.startTime} - {slot.endTime}
                  </p>
                  <Badge variant={slot.isActive ? "secondary" : "outline"}>
                    {slot.isActive ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
                <Badge variant="outline" className="text-xs">
                  {getRegionName(slot.regionId)}
                </Badge>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="w-full mt-2"
              onClick={() => handleEdit(slot)}
              data-testid={`button-edit-${slot.id}`}
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

function SlotForm({
  slot,
  regions,
  onClose,
}: {
  slot: DeliverySlot | null;
  regions: DeliveryRegion[];
  onClose: () => void;
}) {
  const [regionId, setRegionId] = useState(slot?.regionId || "");
  const [startTime, setStartTime] = useState(slot?.startTime || "");
  const [endTime, setEndTime] = useState(slot?.endTime || "");
  const [isActive, setIsActive] = useState(slot?.isActive ?? true);

  return (
    <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div>
        <Label htmlFor="region">Bölge</Label>
        <Select value={regionId} onValueChange={setRegionId}>
          <SelectTrigger data-testid="select-slot-region">
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
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startTime">Başlangıç (HH:MM)</Label>
          <Input
            id="startTime"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            placeholder="09:00"
            data-testid="input-slot-start"
          />
        </div>
        <div>
          <Label htmlFor="endTime">Bitiş (HH:MM)</Label>
          <Input
            id="endTime"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            placeholder="12:00"
            data-testid="input-slot-end"
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="isActive">Aktif</Label>
        <Switch
          id="isActive"
          checked={isActive}
          onCheckedChange={setIsActive}
          data-testid="switch-slot-active"
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          İptal
        </Button>
        <Button type="submit" className="flex-1" data-testid="button-save-slot">
          Kaydet
        </Button>
      </div>
    </form>
  );
}
