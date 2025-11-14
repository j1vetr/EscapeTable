import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, LogOut, Shield } from "lucide-react";
import { useLocation } from "wouter";

export default function Account() {
  const { user, isAdmin, isPersonnel } = useAuth();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const getRoleLabel = () => {
    if (isAdmin) return "Yönetici";
    if (isPersonnel) return "Personel";
    return "Müşteri";
  };

  const getRoleBadgeVariant = () => {
    if (isAdmin) return "default";
    if (isPersonnel) return "secondary";
    return "outline";
  };

  return (
    <div className="pb-20">
      <div className="bg-primary text-primary-foreground px-4 py-6">
        <h1 className="text-2xl font-bold font-heading">Hesabım</h1>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Profile Card */}
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user?.profileImageUrl || undefined} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-semibold" data-testid="text-user-name">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : "Kullanıcı"}
              </h2>
              <p className="text-sm text-muted-foreground" data-testid="text-user-email">
                {user?.email || "email@example.com"}
              </p>
              <Badge variant={getRoleBadgeVariant()} className="mt-2" data-testid="badge-user-role">
                {getRoleLabel()}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Admin Access */}
        {(isAdmin || isPersonnel) && (
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Yönetim Paneli</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Yönetim araçlarına erişim
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setLocation("/admin")}
              data-testid="button-admin-panel"
            >
              Yönetim Paneline Git
            </Button>
          </Card>
        )}

        {/* Logout */}
        <Card className="p-6">
          <Button
            variant="destructive"
            className="w-full"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Çıkış Yap
          </Button>
        </Card>
      </div>
    </div>
  );
}
