// src/pages/dashboard/admin/UserManagement.jsx
import React, { useState, useEffect } from "react";
import {
  useGetAllUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useToggleUserStatusMutation,
  useChangeUserRoleMutation,
  useGetUserStatsQuery,
} from "../../../services/api";
import { toast } from "react-toastify";
import {
  Plus,
  Edit,
  Trash2,
  X,
  Check,
  UserCheck,
  UserX,
  Shield,
  Users,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  RefreshCw,
  FilterX,
  AlertCircle,
} from "lucide-react";
import ModalShell from "../../../components/common/ModalShell";
import {
  dashboardInputClass,
  dashboardSelectClass,
  modalCloseButtonClass,
  modalPrimaryButtonClass,
  modalSecondaryButtonClass,
} from "../../../components/common/modalStyles";

/** API may omit isActive or send string/number; normalize for UI and toggles. */
function parseUserActive(value) {
  if (value === true || value === "true" || value === 1 || value === "1") {
    return true;
  }
  if (value === false || value === "false" || value === 0 || value === "0") {
    return false;
  }
  return null;
}

function getRoleDotClass(role) {
  switch (role) {
    case "admin":
      return "bg-red-500 dark:bg-red-400";
    case "manager":
      return "bg-purple-500 dark:bg-purple-400";
    default:
      return "bg-blue-500 dark:bg-blue-400";
  }
}

const UserManagement = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isListRefreshing, setIsListRefreshing] = useState(false);
  const itemsPerPage = 10;

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(0);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Build query params - FIXED: Don't send empty values
  const queryParams = {
    page: currentPage + 1,
    limit: itemsPerPage,
  };

  // Only add search if it has value
  if (debouncedSearch && debouncedSearch.trim() !== "") {
    queryParams.search = debouncedSearch.trim();
  }

  // Only add role if it has value and not 'all'
  if (roleFilter && roleFilter !== "" && roleFilter !== "all") {
    queryParams.role = roleFilter;
  }

  // Only add isActive if it has value and not 'all'
  if (statusFilter && statusFilter !== "" && statusFilter !== "all") {
    queryParams.isActive = statusFilter === "true";
  }


  const {
    data: usersData,
    isLoading,
    isFetching,
    refetch,
    error: usersError,
  } = useGetAllUsersQuery(queryParams);

  const { data: statsData, refetch: refetchStats } = useGetUserStatsQuery();

  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [toggleStatus] = useToggleUserStatusMutation();
  const [changeRole] = useChangeUserRoleMutation();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user",
    isActive: true,
  });

  const [formErrors, setFormErrors] = useState({});

  const users = usersData?.data || [];
  const totalItems = usersData?.pagination?.totalItems || 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const stats = statsData?.data;

  const validateForm = () => {
    const errors = {};
    if (!formData.username.trim()) {
      errors.username = "Username is required";
    }
    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }
    if (!editingUser && !formData.password) {
      errors.password = "Password is required";
    } else if (!editingUser && formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingUser) {
        const updateData = {
          id: editingUser._id,
          username: formData.username,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive,
        };
        await updateUser(updateData).unwrap();
        toast.success("User updated successfully");
      } else {
        await createUser(formData).unwrap();
        toast.success("User created successfully");
      }
      setShowModal(false);
      setEditingUser(null);
      resetForm();
      refetch();
      refetchStats();
    } catch (error) {
      toast.error(error?.data?.message || "Failed to save user");
    }
  };

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "user",
      isActive: true,
    });
    setFormErrors({});
    setShowPassword(false);
  };

  const handleDelete = async (id, username) => {
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      try {
        await deleteUser(id).unwrap();
        toast.success("User deleted successfully");
        refetch();
        refetchStats();
      } catch (error) {
        toast.error(error?.data?.message || "Failed to delete user");
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus, username) => {
    const newStatus = !currentStatus;
    const action = newStatus ? "activate" : "deactivate";

    if (
      window.confirm(`Are you sure you want to ${action} user "${username}"?`)
    ) {
      try {
        await toggleStatus({ id, isActive: newStatus }).unwrap();
        toast.success(`User ${action}d successfully`);
        refetch();
        refetchStats();
      } catch (error) {
        toast.error(error?.data?.message || `Failed to ${action} user`);
      }
    }
  };

  const handleChangeRole = async (id, newRole, username) => {
    if (
      window.confirm(
        `Change role of "${username}" to ${newRole.toUpperCase()}?`,
      )
    ) {
      try {
        await changeRole({ id, role: newRole }).unwrap();
        toast.success(`User role changed to ${newRole.toUpperCase()}`);
        refetch();
        refetchStats();
      } catch (error) {
        toast.error(error?.data?.message || "Failed to change role");
      }
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
      isActive: parseUserActive(user.isActive) ?? true,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setCurrentPage(0);
  };

  const handleDataRefresh = async () => {
    setIsListRefreshing(true);
    try {
      await Promise.all([refetch(), refetchStats()]);
      toast.success("Users list refreshed");
    } catch {
      toast.error("Could not refresh users");
    } finally {
      setIsListRefreshing(false);
    }
  };

  if (isLoading && currentPage === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-eco-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage system users, roles, and permissions
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setEditingUser(null);
            resetForm();
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-eco-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-eco-700 focus:outline-none focus:ring-2 focus:ring-eco-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-eco-100 dark:bg-eco-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-eco-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Users</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {stats.active}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <UserCheck className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inactive Users</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {stats.inactive}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <UserX className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Administrators</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.byRole?.admin || 0}
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Shield className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 ${dashboardInputClass}`}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Role
          </label>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(0);
            }}
            className={`min-w-[10.5rem] ${dashboardSelectClass}`}
          >
            <option value="">All Roles</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="user">User</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(0);
            }}
            className={`min-w-[10.5rem] ${dashboardSelectClass}`}
          >
            <option value="">All Status</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleDataRefresh()}
            disabled={isListRefreshing}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={isListRefreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <FilterX size={16} />
            Clear filters
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isFetching && (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-eco-600"></div>
                      <span className="text-sm text-gray-500">Loading...</span>
                    </div>
                  </td>
                </tr>
              )}
              {!isFetching && users.length === 0 && (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 dark:text-gray-400">
                      No users found
                    </p>
                    {(searchTerm || roleFilter || statusFilter) && (
                      <button
                        onClick={clearFilters}
                        className="mt-3 text-eco-600 hover:text-eco-700 font-medium text-sm"
                      >
                        Clear filters →
                      </button>
                    )}
                  </td>
                </tr>
              )}
              {!isFetching &&
                users.map((user) => {
                  const activeState = parseUserActive(user.isActive);
                  return (
                  <tr
                    key={user._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-eco-500 to-ocean-500 flex items-center justify-center text-white font-semibold shadow-sm">
                          {user.username?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.username}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {user._id?.slice(-8) || "N/A"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex max-w-[12rem] items-center gap-2">
                        <span
                          className={`h-2 w-2 shrink-0 rounded-full ${getRoleDotClass(
                            user.role,
                          )}`}
                          aria-hidden
                        />
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleChangeRole(
                              user._id,
                              e.target.value,
                              user.username,
                            )
                          }
                          className={`${dashboardSelectClass} cursor-pointer text-xs`}
                          aria-label={`Change role for ${user.username}`}
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="user">User</option>
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          handleToggleStatus(
                            user._id,
                            activeState === true,
                            user.username,
                          )
                        }
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                          activeState === true
                            ? "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/40 dark:text-green-200 dark:hover:bg-green-900/60"
                            : activeState === false
                              ? "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                              : "bg-amber-100 text-amber-900 hover:bg-amber-200 dark:bg-amber-900/40 dark:text-amber-100 dark:hover:bg-amber-900/60"
                        }`}
                      >
                        {activeState === true
                          ? "Active"
                          : activeState === false
                            ? "Inactive"
                            : "Unknown"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-1.5 rounded-lg text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors"
                          title="Edit User"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id, user.username)}
                          className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete User"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
                })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              Showing {currentPage * itemsPerPage + 1} to{" "}
              {Math.min((currentPage + 1) * itemsPerPage, totalItems)} of{" "}
              {totalItems} users
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage > totalPages - 3) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === pageNum
                          ? "bg-eco-600 text-white"
                          : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                      }`}
                    >
                      {pageNum + 1}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={currentPage === totalPages - 1}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ModalShell
        open={showModal}
        onClose={() => setShowModal(false)}
        maxWidthClass="max-w-md"
      >
        <div className="p-6">
            <div className="mb-4 flex items-start justify-between gap-3 border-b border-gray-200 pb-4 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingUser ? "Edit User" : "Add New User"}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {editingUser
                    ? "Update user information"
                    : "Create a new system user"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className={modalCloseButtonClass}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className={`${dashboardInputClass} ${
                    formErrors.username
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  required
                />
                {formErrors.username && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.username}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className={`${dashboardInputClass} ${
                    formErrors.email
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  required
                />
                {formErrors.email && (
                  <p className="text-xs text-red-500 mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>
              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className={`${dashboardInputClass} pr-10 ${
                        formErrors.password
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                      required={!editingUser}
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum 6 characters
                  </p>
                  {formErrors.password && (
                    <p className="text-xs text-red-500 mt-1">
                      {formErrors.password}
                    </p>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className={dashboardSelectClass}
                >
                  <option value="user">User</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-eco-600 focus:ring-eco-500 rounded border-gray-300"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer"
                >
                  Active (user can login)
                </label>
              </div>
              <div className="flex gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                <button type="submit" className={modalPrimaryButtonClass}>
                  <Check size={16} />
                  {editingUser ? "Update User" : "Create User"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className={modalSecondaryButtonClass}
                >
                  Cancel
                </button>
              </div>
            </form>
        </div>
      </ModalShell>
    </div>
  );
};

export default UserManagement;
