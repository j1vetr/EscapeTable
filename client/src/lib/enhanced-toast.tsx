import { toast } from "@/hooks/use-toast";
import { CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";

interface EnhancedToastOptions {
  title: string;
  description?: string;
  type?: "success" | "error" | "warning" | "info";
  productImage?: string;
  productName?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

export function enhancedToast({
  title,
  description,
  type = "info",
  productImage,
  productName,
  action,
  duration = 3000,
}: EnhancedToastOptions) {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertCircle className="w-5 h-5 text-yellow-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />,
  };

  const bgColors = {
    success: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800",
    error: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800",
    warning: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800",
    info: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800",
  };

  const toastContent = (
    <div className="flex items-center gap-3">
      {productImage && (
        <img
          src={productImage}
          alt={productName || "Product"}
          className="w-12 h-12 rounded-md object-cover flex-shrink-0"
        />
      )}
      <div className="flex items-start gap-2 flex-1">
        {icons[type]}
        <div>
          <p className="font-semibold text-sm">{title}</p>
          {productName && <p className="text-xs text-muted-foreground">{productName}</p>}
        </div>
      </div>
    </div>
  );

  return toast({
    title: toastContent as any,
    description: description,
    action: action ? (
      <button
        onClick={action.onClick}
        className="text-xs font-medium underline hover:no-underline"
        data-testid="toast-action-button"
      >
        {action.label}
      </button>
    ) as any : undefined,
    duration,
    className: bgColors[type],
  });
}
