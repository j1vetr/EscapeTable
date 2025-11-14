export function isUnauthorizedError(error: Error): boolean {
  return /^401: .*Unauthorized/.test(error.message);
}

export function formatPrice(priceInCents: number): string {
  return `₺${(priceInCents / 100).toFixed(2)}`;
}

export function getOrderStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    preparing: 'Hazırlanıyor',
    on_delivery: 'Yolda',
    delivered: 'Teslim Edildi',
    cancelled: 'İptal Edildi',
  };
  return labels[status] || status;
}

export function getOrderStatusColor(status: string): string {
  const colors: Record<string, string> = {
    preparing: 'bg-status-preparing',
    on_delivery: 'bg-status-ondelivery',
    delivered: 'bg-status-delivered',
    cancelled: 'bg-status-cancelled',
  };
  return colors[status] || 'bg-gray-500';
}

export function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: 'Nakit',
    bank_transfer: 'Havale',
  };
  return labels[method] || method;
}
