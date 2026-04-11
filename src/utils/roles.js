/** Backend roles: admin, manager (project manager), user (view-only). */

export const ROLES = {
  ADMIN: "admin",
  MANAGER: "manager",
  USER: "user",
};

export function getUserRole(user) {
  const r = user?.role;
  if (r === ROLES.ADMIN || r === ROLES.MANAGER || r === ROLES.USER) return r;
  return ROLES.USER;
}

export function isViewOnlyUser(user) {
  return getUserRole(user) === ROLES.USER;
}

/** Hardware / sampling interval — admin + manager only */
export function canAccessControlPanel(user) {
  const r = getUserRole(user);
  return r === ROLES.ADMIN || r === ROLES.MANAGER;
}

/** Blog + contact messages — admin + manager */
export function canAccessContentAdmin(user) {
  return canAccessControlPanel(user);
}

/** User list, roles, create/delete — admin only */
export function canManageUsers(user) {
  return getUserRole(user) === ROLES.ADMIN;
}

export function getCurrentUserId(user) {
  if (!user) return null;
  return user._id ?? user.id ?? null;
}

/** Admins cannot change their own role (UI + guard for API calls). */
export function isAdminEditingOwnRole(authUser, targetUserId) {
  if (!authUser || !targetUserId) return false;
  const self = getCurrentUserId(authUser);
  if (!self || String(self) !== String(targetUserId)) return false;
  return getUserRole(authUser) === ROLES.ADMIN;
}
