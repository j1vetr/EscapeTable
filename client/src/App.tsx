import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/context/CartContext";
import { useAuth } from "@/hooks/useAuth";
import { MobileNav } from "@/components/mobile-nav";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Header } from "@/components/header";

// Customer Pages
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Categories from "@/pages/categories";
import CategoryDetail from "@/pages/category-detail";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import Checkout from "@/pages/checkout";
import Orders from "@/pages/orders";
import OrderSuccess from "@/pages/order-success";
import Account from "@/pages/account";
import Login from "@/pages/login";
import Register from "@/pages/register";

// Admin Pages
import AdminDashboard from "@/pages/admin/dashboard";
import AdminCategories from "@/pages/admin/categories";
import AdminProducts from "@/pages/admin/products";
import AdminOrders from "@/pages/admin/orders";
import AdminRegions from "@/pages/admin/regions";
import AdminLocations from "@/pages/admin/locations";
import AdminSlots from "@/pages/admin/slots";
import AdminSettings from "@/pages/admin/settings";

import NotFound from "@/pages/not-found";

function CustomerRouter() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <Route path="/categories" component={Categories} />
        <Route path="/categories/:id" component={CategoryDetail} />
        <Route path="/products/:id" component={ProductDetail} />
        <Route path="/cart" component={Cart} />
        <Route path="/checkout" component={Checkout} />
        <Route path="/orders" component={Orders} />
        <Route path="/order-success/:orderId" component={OrderSuccess} />
        <Route path="/account" component={Account} />
        <Route component={NotFound} />
      </Switch>
      <MobileNav />
    </div>
  );
}

function AdminRouter() {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto">
        <Switch>
          <Route path="/admin" component={AdminDashboard} />
          <Route path="/admin/categories" component={AdminCategories} />
          <Route path="/admin/products" component={AdminProducts} />
          <Route path="/admin/orders" component={AdminOrders} />
          <Route path="/admin/regions" component={AdminRegions} />
          <Route path="/admin/locations" component={AdminLocations} />
          <Route path="/admin/slots" component={AdminSlots} />
          <Route path="/admin/settings" component={AdminSettings} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function LoginPrompt() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-lg p-8 text-center space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Giriş Yapın</h2>
        <p className="text-muted-foreground">
          Bu sayfaya erişmek için giriş yapmanız gerekiyor.
        </p>
        <div className="flex flex-col gap-3">
          <a
            href="/login"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover-elevate active-elevate-2"
            data-testid="button-login"
          >
            Giriş Yap
          </a>
          <a
            href="/register"
            className="inline-block bg-secondary text-secondary-foreground px-6 py-3 rounded-md font-medium hover-elevate active-elevate-2"
            data-testid="button-register"
          >
            Kayıt Ol
          </a>
        </div>
      </div>
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Admin routes require authentication
  if (location.startsWith("/admin")) {
    if (!isAuthenticated) {
      return <LoginPrompt />;
    }
    return <AdminRouter />;
  }

  // Protected customer routes require authentication
  const protectedRoutes = ["/checkout", "/orders", "/order-success", "/account"];
  if (protectedRoutes.some(route => location.startsWith(route)) && !isAuthenticated) {
    return <LoginPrompt />;
  }

  // All other routes are accessible without authentication
  return <CustomerRouter />;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
          <Router />
          <Toaster />
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
