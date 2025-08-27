import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

type ProtectedRouteProps = {
  children: React.ReactNode;
  requiredRole?: string;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (requiredRole) {
    const normalizedRole = requiredRole.toLowerCase();
    const userRole = user?.role?.toLowerCase() ?? "";

    if (userRole !== normalizedRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
