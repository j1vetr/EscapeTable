import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const loginSchema = z.object({
  email: z.string().email("Geçerli bir e-posta adresi girin"),
  password: z.string().min(1, "Şifre gerekli"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormValues) => {
      return await apiRequest("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Giriş Başarılı",
        description: "Hoş geldiniz!",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Giriş Başarısız",
        description: error.message || "E-posta veya şifre hatalı",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-lg border-2 border-border p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-2">Giriş Yap</h1>
          <p className="text-sm text-muted-foreground">
            Hesabınıza giriş yapın
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-posta</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="ornek@email.com"
                      data-testid="input-email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Şifre</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Şifrenizi girin"
                      data-testid="input-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loginMutation.isPending}
              data-testid="button-login"
            >
              {loginMutation.isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
          </form>
        </Form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Hesabınız yok mu?{" "}
          <Link href="/register">
            <a className="text-primary font-medium hover:underline" data-testid="link-register">
              Kayıt Ol
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
