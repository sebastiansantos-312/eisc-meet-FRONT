import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuthStore from "../stores/useAuthStore";

type ProtectedRouteProps = {
  children: ReactNode;
  requireCompleteProfile?: boolean;
};

const ProtectedRoute = ({ children, requireCompleteProfile = true }: ProtectedRouteProps) => {
  const location = useLocation();
  const { authUser, loading, profile } = useAuthStore();

  if (loading) {
    return (
      <main className="grid min-h-screen place-items-center bg-background px-4 text-foreground">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Restaurando tu sesion...</p>
        </div>
      </main>
    );
  }

  if (!authUser) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requireCompleteProfile && !profile?.profileCompleted) {
    return <Navigate to="/complete-profile" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;
