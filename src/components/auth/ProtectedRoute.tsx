import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "admin" | "editor";
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, role, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-gold" />
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // No role assigned
  if (!role) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-display text-2xl mb-4">Acesso Negado</h1>
          <p className="text-muted-foreground">
            Você não possui permissão para acessar o painel administrativo.
          </p>
        </div>
      </div>
    );
  }

  // Check specific role requirement
  if (requiredRole === "admin" && role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="font-display text-2xl mb-4">Permissão Insuficiente</h1>
          <p className="text-muted-foreground">
            Esta área é restrita a administradores.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
