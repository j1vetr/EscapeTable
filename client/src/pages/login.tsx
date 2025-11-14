import { useEffect } from "react";

export default function Login() {
  useEffect(() => {
    // Redirect to Replit Auth login endpoint
    window.location.href = "/api/auth/login";
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Giriş sayfasına yönlendiriliyorsunuz...</p>
    </div>
  );
}
