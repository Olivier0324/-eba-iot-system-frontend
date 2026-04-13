// src/components/ProtectedRoutes.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoutes() {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.isActive === false) {
    return <Navigate to="/account-inactive" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoutes;
