import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/hooks/auth';
import { UserRole } from '@/types/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRole?: UserRole | UserRole[];
}

export const ProtectedRoute = ({
  children,
  allowedRole,
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, role } = useAuthStore();

  // 1. Não autenticado → login
  if (!isAuthenticated || !role) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 2. Sem restrição de role → passa
  if (!allowedRole) return <>{children}</>;

  // 3. Verificar role
  const allowed = Array.isArray(allowedRole) ? allowedRole : [allowedRole];
  if (allowed.includes(role)) return <>{children}</>;

  // 4. Role errada → redireciona para login
  return <Navigate to="/login" replace />;
};
