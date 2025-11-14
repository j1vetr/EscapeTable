import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShoppingBag, Truck, Clock, MapPin } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with dark green background */}
      <section className="relative bg-primary text-primary-foreground">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/20" />
        <div className="relative container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold font-heading">
              Kamp Keyfiniz Yarım Kalmasın
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90">
              Karavan ve glamping alanlarına premium yiyecek-içecek teslimatı. 
              Hızlı, güvenilir, lezzetli.
            </p>
            <div className="pt-4">
              <Button 
                size="lg" 
                variant="secondary"
                className="text-lg px-8"
                onClick={() => window.location.href = '/api/login'}
                data-testid="button-login"
              >
                Giriş Yap / Kayıt Ol
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 font-heading">
            Neden EscapeTable?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center hover-elevate">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Premium Ürünler</h3>
              <p className="text-sm text-muted-foreground">
                Özenle seçilmiş kaliteli yiyecek ve içecekler
              </p>
            </Card>

            <Card className="p-6 text-center hover-elevate">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Hızlı Teslimat</h3>
              <p className="text-sm text-muted-foreground">
                Kamp alanınıza hızlı ve güvenli teslimat
              </p>
            </Card>

            <Card className="p-6 text-center hover-elevate">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Esnek Saatler</h3>
              <p className="text-sm text-muted-foreground">
                Size uygun zaman dilimini seçin
              </p>
            </Card>

            <Card className="p-6 text-center hover-elevate">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">Geniş Bölge</h3>
              <p className="text-sm text-muted-foreground">
                Fethiye, Datça, Kaş ve çevresinde hizmet
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">
            Hemen Başlayın
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Unuttuğunuz veya ihtiyaç duyduğunuz ürünleri kolayca sipariş edin, 
            kampınızın tadını çıkarın.
          </p>
          <Button 
            size="lg" 
            variant="default"
            className="text-lg px-8"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-get-started"
          >
            Sipariş Vermeye Başla
          </Button>
        </div>
      </section>
    </div>
  );
}
