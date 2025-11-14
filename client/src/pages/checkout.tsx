import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCartContext } from "@/context/CartContext";
import { formatPrice } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { ArrowLeft, MapPin, Clock, CreditCard, CheckCircle } from "lucide-react";
import { useLocation } from "wouter";
import type { DeliveryRegion, CampingLocation, DeliverySlot } from "@shared/schema";

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, clearCart, totalInCents } = useCartContext();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedRegion, setSelectedRegion] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [customAddress, setCustomAddress] = useState("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");

  const { data: regions } = useQuery<DeliveryRegion[]>({
    queryKey: ["/api/delivery-regions"],
  });

  const { data: locations } = useQuery<CampingLocation[]>({
    queryKey: ["/api/camping-locations", { regionId: selectedRegion }],
    enabled: !!selectedRegion && step >= 2,
  });

  const { data: slots } = useQuery<DeliverySlot[]>({
    queryKey: ["/api/delivery-slots", { regionId: selectedRegion }],
    enabled: !!selectedRegion && step >= 3,
  });

  const activeRegions = regions?.filter(r => r.isActive) || [];
  const activeLocations = locations?.filter(l => l.isActive) || [];
  const activeSlots = slots?.filter(s => s.isActive) || [];

  const canProceedStep1 = selectedRegion !== "";
  const canProceedStep2 = selectedLocation !== "" || customAddress.trim() !== "";
  const canProceedStep3 = selectedSlot !== "";
  const canProceedStep4 = paymentMethod !== "";

  const handleNextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return await apiRequest("/api/orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });
    },
    onSuccess: () => {
      clearCart();
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
      toast({
        title: "Sipariş Oluşturuldu",
        description: "Siparişiniz başarıyla oluşturuldu. Sipariş takibi için siparişlerim sayfasını ziyaret edin.",
      });
      setLocation("/orders");
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Sipariş oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const handlePlaceOrder = () => {
    if (items.length === 0) {
      toast({
        title: "Sepet Boş",
        description: "Sipariş vermek için sepetinize ürün ekleyin",
        variant: "destructive",
      });
      return;
    }

    const region = activeRegions.find(r => r.id === selectedRegion);
    const slot = activeSlots.find(s => s.id === selectedSlot);
    
    const estimatedDeliveryTime = slot 
      ? `${slot.startTime} - ${slot.endTime}` 
      : `${region?.minEtaMinutes || 30}-${region?.maxEtaMinutes || 120} dakika`;

    const orderData = {
      deliveryRegionId: selectedRegion,
      campingLocationId: selectedLocation || null,
      deliverySlotId: selectedSlot,
      customAddress: customAddress || null,
      paymentMethod: paymentMethod as "cash" | "bank_transfer",
      totalAmountInCents: totalInCents,
      status: "preparing" as const,
      estimatedDeliveryTime,
      items: items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        priceInCents: item.product.priceInCents,
        subtotalInCents: item.product.priceInCents * item.quantity,
      })),
    };

    createOrderMutation.mutate(orderData);
  };

  return (
    <div className="pb-20">
      <div className="bg-primary text-primary-foreground px-4 py-6">
        <Button
          variant="ghost"
          size="sm"
          className="mb-3 text-primary-foreground hover:bg-primary-foreground/10"
          onClick={() => setLocation("/cart")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Sepete Dön
        </Button>
        <h1 className="text-2xl font-bold font-heading">Sipariş Tamamla</h1>
        <p className="text-sm text-primary-foreground/80 mt-1">
          Adım {step} / 4
        </p>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Progress Indicators */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="flex items-center flex-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm ${
                  step >= num
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step > num ? <CheckCircle className="w-5 h-5" /> : num}
              </div>
              {num < 4 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > num ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Region */}
        {step === 1 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Teslimat Bölgesi Seçin</h2>
            </div>
            <RadioGroup value={selectedRegion} onValueChange={setSelectedRegion}>
              <div className="space-y-3">
                {activeRegions.map((region) => (
                  <div
                    key={region.id}
                    className="flex items-center space-x-3 p-3 border rounded-md hover-elevate"
                  >
                    <RadioGroupItem value={region.id} id={region.id} data-testid={`radio-region-${region.id}`} />
                    <Label htmlFor={region.id} className="flex-1 cursor-pointer">
                      <div className="font-medium">{region.name}</div>
                      <div className="text-xs text-muted-foreground">
                        Teslimat: {region.minEtaMinutes}-{region.maxEtaMinutes} dk
                      </div>
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
            <Button
              className="w-full mt-6"
              disabled={!canProceedStep1}
              onClick={handleNextStep}
              data-testid="button-next-step1"
            >
              Devam Et
            </Button>
          </Card>
        )}

        {/* Step 2: Select Location */}
        {step === 2 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Teslimat Yeri</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="mb-2 block">Kamp Alanı Seçin</Label>
                <RadioGroup value={selectedLocation} onValueChange={(val) => {
                  setSelectedLocation(val);
                  setCustomAddress("");
                }}>
                  <div className="space-y-2">
                    {activeLocations.map((location) => (
                      <div
                        key={location.id}
                        className="flex items-center space-x-3 p-3 border rounded-md hover-elevate"
                      >
                        <RadioGroupItem value={location.id} id={location.id} data-testid={`radio-location-${location.id}`} />
                        <Label htmlFor={location.id} className="flex-1 cursor-pointer">
                          <div className="font-medium">{location.name}</div>
                          {location.address && (
                            <div className="text-xs text-muted-foreground">{location.address}</div>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-card px-2 text-muted-foreground">VEYA</span>
                </div>
              </div>

              <div>
                <Label htmlFor="custom-address" className="mb-2 block">
                  Özel Adres Girin
                </Label>
                <Textarea
                  id="custom-address"
                  placeholder="Adresinizi buraya yazın..."
                  value={customAddress}
                  onChange={(e) => {
                    setCustomAddress(e.target.value);
                    setSelectedLocation("");
                  }}
                  rows={3}
                  data-testid="textarea-custom-address"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={handlePrevStep} data-testid="button-prev-step2">
                Geri
              </Button>
              <Button
                className="flex-1"
                disabled={!canProceedStep2}
                onClick={handleNextStep}
                data-testid="button-next-step2"
              >
                Devam Et
              </Button>
            </div>
          </Card>
        )}

        {/* Step 3: Select Time Slot */}
        {step === 3 && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Teslimat Saati</h2>
            </div>
            <RadioGroup value={selectedSlot} onValueChange={setSelectedSlot}>
              <div className="grid grid-cols-2 gap-3">
                {activeSlots.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center space-x-2 p-3 border rounded-md hover-elevate"
                  >
                    <RadioGroupItem value={slot.id} id={slot.id} data-testid={`radio-slot-${slot.id}`} />
                    <Label htmlFor={slot.id} className="cursor-pointer text-sm">
                      {slot.startTime} - {slot.endTime}
                    </Label>
                  </div>
                ))}
              </div>
            </RadioGroup>
            <div className="flex gap-3 mt-6">
              <Button variant="outline" onClick={handlePrevStep} data-testid="button-prev-step3">
                Geri
              </Button>
              <Button
                className="flex-1"
                disabled={!canProceedStep3}
                onClick={handleNextStep}
                data-testid="button-next-step3"
              >
                Devam Et
              </Button>
            </div>
          </Card>
        )}

        {/* Step 4: Payment Method */}
        {step === 4 && (
          <div className="space-y-4">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Ödeme Yöntemi</h2>
              </div>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border rounded-md hover-elevate">
                    <RadioGroupItem value="cash" id="cash" data-testid="radio-payment-cash" />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer">
                      <div className="font-medium">Nakit</div>
                      <div className="text-xs text-muted-foreground">
                        Teslimat sırasında nakit ödeme
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border rounded-md hover-elevate">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" data-testid="radio-payment-transfer" />
                    <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                      <div className="font-medium">Havale / EFT</div>
                      <div className="text-xs text-muted-foreground">
                        Banka havalesi ile ödeme
                      </div>
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </Card>

            {/* Order Summary */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Sipariş Özeti</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ara Toplam</span>
                  <span>{formatPrice(totalInCents)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Teslimat</span>
                  <Badge variant="secondary">Ücretsiz</Badge>
                </div>
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Toplam</span>
                    <span className="text-xl font-bold text-primary" data-testid="text-order-total">
                      {formatPrice(totalInCents)}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handlePrevStep} data-testid="button-prev-step4">
                Geri
              </Button>
              <Button
                className="flex-1"
                disabled={!canProceedStep4 || createOrderMutation.isPending}
                onClick={handlePlaceOrder}
                data-testid="button-place-order"
              >
                {createOrderMutation.isPending ? "Sipariş Oluşturuluyor..." : "Siparişi Onayla"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
