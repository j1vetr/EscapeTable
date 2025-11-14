import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Settings as SettingsIcon, Save } from "lucide-react";

export default function AdminSettings() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">Ayarlar</h1>
        <p className="text-muted-foreground mt-1">
          Sistem ayarlarını yapılandırın
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Genel Ayarlar</h2>
          </div>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <Label htmlFor="siteName">Site Adı</Label>
              <Input
                id="siteName"
                defaultValue="EscapeTable"
                placeholder="Site adı"
                data-testid="input-site-name"
              />
            </div>
            <div>
              <Label htmlFor="supportEmail">Destek E-posta</Label>
              <Input
                id="supportEmail"
                type="email"
                placeholder="support@escapetable.com"
                data-testid="input-support-email"
              />
            </div>
            <div>
              <Label htmlFor="bannerText">Ana Sayfa Banner Metni</Label>
              <Input
                id="bannerText"
                defaultValue="Kamp Keyfiniz Yarım Kalmasın"
                data-testid="input-banner-text"
              />
            </div>
            <Button type="submit" className="w-full" data-testid="button-save-general">
              <Save className="w-4 h-4 mr-2" />
              Kaydet
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <SettingsIcon className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">Teslimat Ayarları</h2>
          </div>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div>
              <Label htmlFor="defaultMinEta">Varsayılan Min. ETA (dk)</Label>
              <Input
                id="defaultMinEta"
                type="number"
                defaultValue="30"
                data-testid="input-default-min-eta"
              />
            </div>
            <div>
              <Label htmlFor="defaultMaxEta">Varsayılan Max. ETA (dk)</Label>
              <Input
                id="defaultMaxEta"
                type="number"
                defaultValue="120"
                data-testid="input-default-max-eta"
              />
            </div>
            <div>
              <Label htmlFor="deliveryNote">Teslimat Notu</Label>
              <Textarea
                id="deliveryNote"
                placeholder="Müşterilere gösterilecek teslimat bilgisi"
                rows={3}
                data-testid="textarea-delivery-note"
              />
            </div>
            <Button type="submit" className="w-full" data-testid="button-save-delivery">
              <Save className="w-4 h-4 mr-2" />
              Kaydet
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
