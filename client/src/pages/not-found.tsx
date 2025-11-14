import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation } from "wouter";
import { Home } from "lucide-react";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="p-8 md:p-12 text-center max-w-md">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl font-bold text-primary">404</span>
        </div>
        <h1 className="text-3xl font-bold font-heading mb-3">
          Sayfa Bulunamadı
        </h1>
        <p className="text-muted-foreground mb-6">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
        <Button onClick={() => setLocation("/")} data-testid="button-home">
          <Home className="w-4 h-4 mr-2" />
          Ana Sayfaya Dön
        </Button>
      </Card>
    </div>
  );
}
