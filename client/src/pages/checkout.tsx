import { useState, useEffect } from "react";
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
import { ArrowLeft, MapPin, Clock, CreditCard, CheckCircle, Calendar, StickyNote } from "lucide-react";
import { useLocation } from "wouter";
import { addDays } from "date-fns";
import { toZonedTime, formatInTimeZone } from "date-fns-tz";
import { tr } from "date-fns/locale";
import type { CampingLocation } from "@shared/schema";

const ISTANBUL_TIMEZONE = "Europe/Istanbul";

// Time slot generation helper
interface TimeSlot {
  id: string;
  label: string;
  startTime: string;
  endTime: string;
  date: Date;
}

function generateTimeSlots(date: Date, currentHour?: number): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const dateStr = formatInTimeZone(date, ISTANBUL_TIMEZONE, "yyyy-MM-dd");
  const startHour = currentHour !== undefined ? Math.max(currentHour + 1, 8) : 8;
  const endHour = 22;

  for (let hour = startHour; hour < endHour; hour++) {
    const startTime = `${hour.toString().padStart(2, "0")}:00`;
    const endTime = `${(hour + 1).toString().padStart(2, "0")}:00`;
    slots.push({
      id: `${dateStr}-${hour}`,
      label: `${startTime} - ${endTime}`,
      startTime,
      endTime,
      date,
    });
  }

  return slots;
}

export default function Checkout() {
  const [, setLocation] = useLocation();
  const { items, clearCart, totalInCents } = useCartContext();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [selectedDay, setSelectedDay] = useState<"today" | "tomorrow">("today");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  
  // Keep current time fresh to recalculate slots as Istanbul time advances
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    // Update current time every minute to keep slots fresh
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 60 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Get all camping locations (like navbar does)
  const { data: locations } = useQuery<CampingLocation[]>({
    queryKey: ["/api/camping-locations"],
  });

  const activeLocations = locations?.filter(l => l.isActive) || [];

  // Generate dynamic time slots based on Istanbul time
  // Uses currentTime state that updates every minute
  const currentHour = Number(formatInTimeZone(currentTime, ISTANBUL_TIMEZONE, "H"));
  const nowIstanbul = toZonedTime(currentTime, ISTANBUL_TIMEZONE);
  
  const timeSlots = {
    today: generateTimeSlots(nowIstanbul, currentHour),
    tomorrow: generateTimeSlots(addDays(nowIstanbul, 1)),
  };

  // Available slots based on selected day
  const availableSlots = selectedDay === "today" ? timeSlots.today : timeSlots.tomorrow;
  
  // Smart midnight rollover: preserve user's intended date
  // Only allow tomorrow→today migration, prevent multi-day drift
  useEffect(() => {
    if (selectedTimeSlot) {
      const selectedHour = parseInt(selectedTimeSlot.split('-').pop() || '0');
      
      // Check if hour exists in today's slots
      const todayHasHour = timeSlots.today.find(s => 
        parseInt(s.id.split('-').pop() || '0') === selectedHour
      );
      
      if (selectedDay === "tomorrow" && todayHasHour) {
        // Midnight rollover: user's "tomorrow" became "today"
        // This preserves the user's original calendar date choice
        setSelectedDay("today");
        setSelectedTimeSlot(todayHasHour.id);
      } else if (selectedDay === "today" && !todayHasHour) {
        // Hour passed or became unavailable
        // Clear selection (don't drift to tomorrow)
        setSelectedTimeSlot("");
      } else {
        // Normal case: just update ID for current day
        const currentSlots = selectedDay === "today" ? timeSlots.today : timeSlots.tomorrow;
        const matchingSlot = currentSlots.find(s => 
          parseInt(s.id.split('-').pop() || '0') === selectedHour
        );
        
        if (matchingSlot && matchingSlot.id !== selectedTimeSlot) {
          setSelectedTimeSlot(matchingSlot.id);
        }
      }
    }
  }, [timeSlots, selectedTimeSlot, selectedDay]);

  const canProceedStep1 = selectedLocation !== "";
  const canProceedStep2 = selectedTimeSlot !== "";
  const canProceedStep3 = paymentMethod !== "";

  const handleNextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return await apiRequest("POST", "/api/orders", orderData);
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

    const selectedSlot = availableSlots.find(s => s.id === selectedTimeSlot);
    if (!selectedSlot) {
      toast({
        title: "Hata",
        description: "Lütfen geçerli bir teslimat saati seçin",
        variant: "destructive",
      });
      return;
    }

    const deliveryDateStr = formatInTimeZone(selectedSlot.date, ISTANBUL_TIMEZONE, "dd MMMM yyyy", { locale: tr });
    const estimatedDeliveryTime = `${deliveryDateStr} ${selectedSlot.startTime} - ${selectedSlot.endTime}`;

    const orderData = {
      deliveryRegionId: null, // İstanbul fixed
      campingLocationId: selectedLocation || null,
      deliverySlotId: null, // Custom time slot
      customAddress: deliveryNote || null,
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
          Adım {step} / 3
        </p>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Progress Indicators */}
        <div className="flex items-center justify-between mb-6">
          {[1, 2, 3].map((num) => (
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
              {num < 3 && (
                <div
                  className={`flex-1 h-1 mx-2 ${
                    step > num ? "bg-primary" : "bg-muted"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step 1: Select Location & Note */}
        {step === 1 && (
          <Card className="p-6 border-2">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Teslimat Yeri</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label className="mb-3 block font-medium">Karavan Parkı Seçin</Label>
                <RadioGroup value={selectedLocation} onValueChange={setSelectedLocation}>
                  <div className="space-y-2">
                    {activeLocations.map((location) => (
                      <div
                        key={location.id}
                        className="flex items-center space-x-3 p-3 border-2 rounded-md hover-elevate"
                      >
                        <RadioGroupItem value={location.id} id={location.id} data-testid={`radio-location-${location.id}`} />
                        <Label htmlFor={location.id} className="flex-1 cursor-pointer">
                          <div className="font-medium">{location.name}</div>
                          {location.address && (
                            <div className="text-xs text-muted-foreground mt-1">{location.address}</div>
                          )}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              <div className="pt-2">
                <Label htmlFor="delivery-note" className="mb-3 flex items-center gap-2 font-medium">
                  <StickyNote className="w-4 h-4 text-primary" />
                  Teslimat Notu (Opsiyonel)
                </Label>
                <Textarea
                  id="delivery-note"
                  placeholder="Özel talimatlarınız veya ek adres bilgileriniz..."
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  rows={3}
                  className="border-2"
                  data-testid="textarea-delivery-note"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Örn: "Mavi karavan, girişteki üçüncü sıra"
                </p>
              </div>
            </div>

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

        {/* Step 2: Select Time Slot */}
        {step === 2 && (
          <Card className="p-6 border-2">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Teslimat Saati</h2>
            </div>
            
            {/* Day Selection */}
            <div className="mb-6">
              <Label className="mb-3 flex items-center gap-2 font-medium">
                <Calendar className="w-4 h-4 text-primary" />
                Teslimat Günü
              </Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDay("today");
                    setSelectedTimeSlot("");
                  }}
                  className={`p-4 border-2 rounded-md text-left hover-elevate active-elevate-2 ${
                    selectedDay === "today" ? "border-primary bg-primary/5" : ""
                  }`}
                  data-testid="button-select-today"
                >
                  <div className="font-semibold">Bugün</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatInTimeZone(toZonedTime(new Date(), ISTANBUL_TIMEZONE), ISTANBUL_TIMEZONE, "dd MMMM", { locale: tr })}
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDay("tomorrow");
                    setSelectedTimeSlot("");
                  }}
                  className={`p-4 border-2 rounded-md text-left hover-elevate active-elevate-2 ${
                    selectedDay === "tomorrow" ? "border-primary bg-primary/5" : ""
                  }`}
                  data-testid="button-select-tomorrow"
                >
                  <div className="font-semibold">Yarın</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatInTimeZone(addDays(toZonedTime(new Date(), ISTANBUL_TIMEZONE), 1), ISTANBUL_TIMEZONE, "dd MMMM", { locale: tr })}
                  </div>
                </button>
              </div>
            </div>

            {/* Time Slot Selection */}
            <div>
              <Label className="mb-3 block font-medium">Teslimat Saati Aralığı</Label>
              {availableSlots.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Bugün için müsait teslimat saati kalmamıştır.</p>
                  <p className="text-sm mt-1">Lütfen yarın için sipariş verin.</p>
                </div>
              ) : (
                <RadioGroup value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                  <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                    {availableSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className="flex items-center space-x-2 p-3 border-2 rounded-md hover-elevate"
                      >
                        <RadioGroupItem value={slot.id} id={slot.id} data-testid={`radio-timeslot-${slot.id}`} />
                        <Label htmlFor={slot.id} className="cursor-pointer text-sm font-medium">
                          {slot.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              )}
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

        {/* Step 3: Payment Method */}
        {step === 3 && (
          <div className="space-y-4">
            <Card className="p-6 border-2">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Ödeme Yöntemi</h2>
              </div>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-md hover-elevate">
                    <RadioGroupItem value="cash" id="cash" data-testid="radio-payment-cash" />
                    <Label htmlFor="cash" className="flex-1 cursor-pointer">
                      <div className="font-medium">Nakit</div>
                      <div className="text-xs text-muted-foreground">
                        Teslimat sırasında nakit ödeme
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-4 border-2 rounded-md hover-elevate">
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
            <Card className="p-6 border-2">
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
              <Button variant="outline" onClick={handlePrevStep} data-testid="button-prev-step3">
                Geri
              </Button>
              <Button
                className="flex-1"
                disabled={!canProceedStep3 || createOrderMutation.isPending}
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
