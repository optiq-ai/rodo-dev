import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredPermission 
}) => {
  const { isAuthenticated, hasPermission } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Przekierowanie do strony logowania z zapisaniem oryginalnej ścieżki
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Jeśli wymagane jest konkretne uprawnienie, sprawdź czy użytkownik je posiada
  if (requiredPermission && !hasPermission(requiredPermission)) {
    // Przekierowanie do strony błędu 403 (brak dostępu)
    return <Navigate to="/forbidden" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
