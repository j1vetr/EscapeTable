import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { User, LogOut, Shield, Edit, X, Save, Mail, Phone } from "lucide-react";
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
      <div className="pb-20 min-h-screen bg-gradient-to-b from-background to-muted/30">
        <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/95 to-primary/80 text-primary-foreground px-4 py-8">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          <div className="relative">
            <h1 className="text-3xl font-bold font-heading">Hesabım</h1>
            <p className="text-primary-foreground/80 mt-2">Profil bilgilerinizi yönetin</p>
          </div>
        </div>
        <div className="px-4 py-6 space-y-4 max-w-3xl mx-auto">
          <Card className="border-2">
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Premium Header with Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/95 to-primary/80 text-primary-foreground px-4 py-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-foreground/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-foreground/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold font-heading">Hesabım</h1>
          <p className="text-primary-foreground/80 mt-2">Profil bilgilerinizi yönetin</p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6 max-w-3xl mx-auto">
        {/* Profile Information Card */}
        <Card className="border-2 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-muted/50 to-muted/30 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <Avatar className="w-20 h-20 border-4 border-background shadow-lg flex-shrink-0">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    <User className="w-10 h-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-2xl truncate" data-testid="text-user-name">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : "Kullanıcı"}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-2 truncate" data-testid="text-user-email">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{user?.email || "email@example.com"}</span>
                  </CardDescription>
                  <Badge variant={getRoleBadgeVariant()} className="mt-2" data-testid="badge-user-role">
                    {getRoleLabel()}
                  </Badge>
                </div>
              </div>
              {!isEditing && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  disabled={updateProfileMutation.isPending}
                  className="w-full sm:w-auto flex-shrink-0"
                  data-testid="button-edit-profile"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Düzenle
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {!isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Ad</label>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium" data-testid="text-firstname-display">{user?.firstName || "-"}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground">Soyad</label>
                    <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium" data-testid="text-lastname-display">{user?.lastName || "-"}</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Telefon</label>
                  <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium" data-testid="text-phone-display">{user?.phone || "-"}</span>
                  </div>
                </div>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ad</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                {...field}
                                value={field.value || ""}
                                placeholder="Adınız"
                                className="pl-10 border-2"
                                data-testid="input-firstname"
                              />
                            </div>
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
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                              <Input
                                {...field}
                                value={field.value || ""}
                                placeholder="Soyadınız"
                                className="pl-10 border-2"
                                data-testid="input-lastname"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefon Numarası</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                              {...field}
                              value={field.value || ""}
                              type="tel"
                              maxLength={10}
                              placeholder="5xxxxxxxxx"
                              className="pl-10 border-2"
                              data-testid="input-phone"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-3 pt-2">
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
          </CardContent>
        </Card>

        {/* Admin Access */}
        {(isAdmin || isPersonnel) && (
          <Card className="border-2 overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Shield className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Yönetim Paneli</CardTitle>
                  <CardDescription>Yönetim araçlarına erişim</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setLocation("/admin")}
                data-testid="button-admin-panel"
              >
                Yönetim Paneline Git
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Logout Section */}
        <Card className="border-2 border-destructive/20 overflow-hidden">
          <CardContent className="p-6">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
              data-testid="button-logout"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Çıkış Yap
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
