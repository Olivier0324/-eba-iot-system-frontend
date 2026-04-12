import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { canAccessReportsAlertsNotifications } from "../utils/roles";

/**
 * Blocks role `user` from reports / alerts / notifications routes (managers + admins only).
 */
function RequireStaffInsights({ children }) {
  const user = useSelector((s) => s.auth.user);
  if (!canAccessReportsAlertsNotifications(user)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default RequireStaffInsights;
