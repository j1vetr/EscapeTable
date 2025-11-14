import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { User, LogOut, Shield, Edit, X, Save } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { updateUserSchema, type UpdateUser, type User as UserType } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getQueryFn } from "@/lib/queryClient";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export default function Account() {
  const { isAdmin, isPersonnel, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch user data with useQuery - return null on 401 instead of throwing
  const { data: user, isLoading } = useQuery<UserType | null>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  const [isEditing, setIsEditing] = useState(false);

  // Redirect if not authenticated (user will be null on 401)
  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
  }, [isLoading, user, setLocation]);
  
  // useForm with zodResolver
  const form = useForm<UpdateUser>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
    },
  });

  // Update form when user data changes (only when not editing)
  useEffect(() => {
    if (user && !isEditing) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
      });
    }
  }, [user, isEditing, form]);

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      setLocation("/login");
    },
    onError: () => {
      toast({
        title: "Çıkış Başarısız",
        description: "Bir hata oluştu",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
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

  const updateProfileMutation = useMutation<UserType, Error, UpdateUser>({
    mutationFn: async (data: UpdateUser) => {
      return await apiRequest("PUT", "/api/user", data);
    },
    onSuccess: (updatedUser: UserType) => {
      // Update form with returned data
      form.reset({
        firstName: updatedUser.firstName || "",
        lastName: updatedUser.lastName || "",
        phone: updatedUser.phone || "",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Profil Güncellendi",
        description: "Bilgileriniz başarıyla güncellendi.",
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Hata",
        description: error.message || "Profil güncellenemedi.",
      });
    },
  });

  const onSubmit = (data: UpdateUser) => {
    updateProfileMutation.mutate(data);
  };

  const handleCancel = () => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        phone: user.phone || "",
      });
    }
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className="pb-20">
        <div className="bg-primary text-primary-foreground px-4 py-6">
          <h1 className="text-2xl font-bold font-heading">Hesabım</h1>
        </div>
        <div className="px-4 py-6 space-y-4">
          <Card className="p-6">
            <Skeleton className="h-20 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      <div className="bg-primary text-primary-foreground px-4 py-6">
        <h1 className="text-2xl font-bold font-heading">Hesabım</h1>
      </div>

      <div className="px-4 py-6 space-y-4">
        {/* Profile Card */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
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
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
                disabled={updateProfileMutation.isPending}
                data-testid="button-edit-profile"
              >
                <Edit className="w-4 h-4 mr-2" />
                Düzenle
              </Button>
            )}
          </div>

          {/* Edit Form */}
          {isEditing && (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4 border-t">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Adınız"
                          data-testid="input-firstname"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Soyad</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="Soyadınız"
                          data-testid="input-lastname"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefon</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          value={field.value || ""}
                          placeholder="+90 555 123 4567"
                          data-testid="input-phone"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={updateProfileMutation.isPending}
                    className="flex-1"
                    data-testid="button-save-profile"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateProfileMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={updateProfileMutation.isPending}
                    data-testid="button-cancel-edit"
                  >
                    <X className="w-4 h-4 mr-2" />
                    İptal
                  </Button>
                </div>
              </form>
            </Form>
          )}
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
