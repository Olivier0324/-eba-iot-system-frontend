// src/components/ProtectedRoutes.jsx
import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function ProtectedRoutes() {
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.isActive === false) {
    return <Navigate to="/account-inactive" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoutes;
