import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext.jsx";
import LoadingSpinner from "@components/LoadingSpinner/LoadingSpinner";

export function ProtectedRoute({ children }) {
  const { user, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/Start" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
