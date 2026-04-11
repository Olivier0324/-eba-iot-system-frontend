import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * Wrap nested routes: only users whose `role` is in `allowedRoles` may access.
 * Others are sent to the main dashboard.
 */
function RoleProtectedLayout({ allowedRoles }) {
  const user = useSelector((s) => s.auth.user);
  const role = user?.role;
  if (!role || !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}

export default RoleProtectedLayout;
