import { useMemo } from "react";
import { useSelector } from "react-redux";
import {
  getUserRole,
  isViewOnlyUser,
  canAccessDeviceControl,
  canManageUsers,
  canAccessContentAdmin,
} from "../utils/roles";

export function usePermissions() {
  const user = useSelector((s) => s.auth.user);
  return useMemo(
    () => ({
      user,
      role: getUserRole(user),
      isViewOnly: isViewOnlyUser(user),
      canControl: canAccessDeviceControl(user),
      canManageUsers: canManageUsers(user),
      canAccessContentAdmin: canAccessContentAdmin(user),
    }),
    [user],
  );
}
