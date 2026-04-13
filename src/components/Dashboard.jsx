// src/components/Dashboard.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../services/reducers/authReducer";
import {
  useLogoutMutation,
  useGetAllSensorDataQuery,
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
} from "../services/api";
import { toast } from "react-toastify";
import { connectSocket, disconnectSocket } from "../services/socket";
import { usePermissions } from "../hooks/usePermissions";
import {
  LayoutDashboard,
  Menu,
  X,
  LogOut,
  User,
  Settings,
  FileText,
  BarChart3,
  Bell,
  Eye,
  Activity,
  Database,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  BookOpen,
  Users,
  MoreHorizontal,
  ChevronsLeft,
  ChevronsRight,
  Inbox,
} from "lucide-react";
import { modalBackdropClass } from "./common/modalStyles";

const SIDEBAR_COLLAPSED_KEY = "eba-dashboard-sidebar-collapsed";

/** Bell menu: unread only, synced with GET /notifications?isRead=false (see API docs). */
const DROPDOWN_UNREAD_LIMIT = 15;

/** BSON / JSON often ships `_id` as `{ $oid: "..." }`; REST may use `id` instead of `_id`. */
function extractNotificationIdField(raw) {
  if (raw == null) return "";
  if (typeof raw === "object" && raw !== null && "$oid" in raw) {
    return String(raw.$oid);
  }
  return String(raw);
}

function apiNotificationRecordId(n) {
  return extractNotificationIdField(n?._id ?? n?.id ?? "");
}

/** `Boolean("false")` is true in JS — treat read flags literally. */
function notificationIsRead(n) {
  const v =
    n.isRead !== undefined && n.isRead !== null ? n.isRead : n.read;
  if (v === true || v === 1) return true;
  if (typeof v === "string") {
    const s = v.toLowerCase();
    return s === "true" || s === "1";
  }
  return false;
}

function mapApiNotification(n) {
  const id = apiNotificationRecordId(n);
  return {
    id,
    title: n.title || "Notification",
    message: n.message || "",
    read: notificationIsRead(n),
    timestamp: n.createdAt ? new Date(n.createdAt) : new Date(),
    priority: n.priority,
    type: n.type,
    fromApi: true,
  };
}

function Dashboard() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "1";
    } catch {
      return false;
    }
  });
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };
  const [showNotifications, setShowNotifications] = useState(false);
  const [latestSensorData, setLatestSensorData] = useState(null);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const [userLogout, { isLoading }] = useLogoutMutation();
  const { canControl, canAccessReportsAlertsNotifications } = usePermissions();

  const { data: notifPayload, refetch: refetchNotifications } =
    useGetNotificationsQuery(
      { page: 1, limit: DROPDOWN_UNREAD_LIMIT, isRead: false },
      {
        skip: !token || !canAccessReportsAlertsNotifications,
        pollingInterval: 60_000,
      },
    );
  const [markNotificationReadApi] = useMarkNotificationAsReadMutation();
  const [markAllNotificationsReadApi] = useMarkAllNotificationsAsReadMutation();

  /** Unread-only rows from the API, newest first (dropdown does not mix in socket-only items). */
  const dropdownNotifications = useMemo(() => {
    const list = (notifPayload?.list || [])
      .map(mapApiNotification)
      .filter((n) => String(n.id).length > 0 && !n.read);
    return [...list].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }, [notifPayload]);

  const unreadCount =
    typeof notifPayload?.unreadCount === "number"
      ? notifPayload.unreadCount
      : dropdownNotifications.length;

  // Fetch latest sensor data
  const { data: sensorData } = useGetAllSensorDataQuery();

  // Update latest sensor data when fetched
  useEffect(() => {
    if (sensorData && Array.isArray(sensorData) && sensorData.length > 0) {
      setLatestSensorData(sensorData[0]);
    }
  }, [sensorData]);

  // Connect to Socket.io on mount (skipped when VITE_ENABLE_SOCKET=0 — see src/services/socket.js)
  useEffect(() => {
    if (token) {
      try {
        const socket = connectSocket(token);
        if (!socket) {
          return undefined;
        }

        if (user?.id) {
          socket.emit("join-user", user.id);
        }

        socket.on("sensor-data", (data) => {
          setLatestSensorData(data);

          if (data.temperature > 35 || data.co2_ppm > 1000) {
            toast.warning(
              `${data.temperature > 35 ? `Temperature at ${data.temperature}°C` : ""} ${data.co2_ppm > 1000 ? `CO\u2082 at ${data.co2_ppm} ppm` : ""}`.trim(),
            );
          }
        });

        socket.on("new-alerts", (alerts) => {
          if (!canAccessReportsAlertsNotifications) return;
          alerts.forEach((alert) => {
            toast.error(alert.title);
          });
          void refetchNotifications();
        });

        return () => {
          socket.off("sensor-data");
          socket.off("new-alerts");
          disconnectSocket();
        };
      } catch {
        // Socket setup failed; notifications will resume on next successful connection.
      }
    }
  }, [
    token,
    user?.id,
    refetchNotifications,
    canAccessReportsAlertsNotifications,
  ]);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location]);

  const handleLogout = async () => {
    try {
      await userLogout().unwrap();
      disconnectSocket();
      dispatch(logout());
      toast.success("You have been logged out successfully");
      navigate("/login");
    } catch (error) {
      dispatch(logout());
      disconnectSocket();
      const errorMessage =
        error.data?.message ||
        error.message ||
        "Logout failed. Please try again.";
      toast.error(errorMessage);
      navigate("/login");
    }
  };

  const markNotificationAsRead = useCallback(
    async (notif) => {
      const sid = String(notif.id ?? "").trim();
      if (!sid) return;
      try {
        await markNotificationReadApi(sid).unwrap();
        await refetchNotifications();
      } catch {
        toast.error("Could not mark notification as read");
      }
    },
    [markNotificationReadApi, refetchNotifications],
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsReadApi().unwrap();
      await refetchNotifications();
    } catch {
      toast.error("Could not mark all notifications as read");
    }
  }, [markAllNotificationsReadApi, refetchNotifications]);

  const isAdmin = user?.role === "admin";

  // Navigation items (role `user`: no reports, alerts, or notifications)
  const navItems = useMemo(() => {
    const core = [
      { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
      { name: "Sensor Data", path: "/dashboard/sensors", icon: Database },
    ];
    const staffInsights = canAccessReportsAlertsNotifications
      ? [
          { name: "Reports", path: "/dashboard/reports", icon: FileText },
          { name: "Alerts", path: "/dashboard/alerts", icon: AlertTriangle },
          { name: "Analytics", path: "/dashboard/analytics", icon: BarChart3 },
          {
            name: "Notifications",
            path: "/dashboard/notifications",
            icon: Inbox,
          },
        ]
      : [
          { name: "Analytics", path: "/dashboard/analytics", icon: BarChart3 },
        ];
    const control = canControl
      ? [
          {
            name: "Control Panel",
            path: "/dashboard/control",
            icon: Activity,
          },
        ]
      : [];
    const tail = [{ name: "Settings", path: "/dashboard/settings", icon: Settings }];
    return [...core, ...staffInsights, ...control, ...tail];
  }, [canControl, canAccessReportsAlertsNotifications]);

  // In Dashboard.jsx, update the adminItems array:
  const adminItems = [
    {
      name: "Contact Messages",
      path: "/dashboard/admin/messages",
      icon: MessageSquare,
    },
    { name: "Blog Management", path: "/dashboard/admin/blog", icon: BookOpen },
    { name: "User Management", path: "/dashboard/admin/users", icon: Users }, // Add this line
  ];

  const currentPage =
    navItems.find((item) => item.path === location.pathname)?.name ||
    adminItems.find((item) => item.path === location.pathname)?.name ||
    "Overview";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-gray-800 shadow-sm z-10">
        <div className="flex items-center">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="mr-4 text-gray-600 dark:text-gray-300 focus:outline-none"
          >
            <Menu size={24} />
          </button>
          <span className="text-xl font-bold bg-linear-to-br from-eco-600 to-ocean-600 bg-clip-text text-transparent">
            EBA OBSERVA
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {canAccessReportsAlertsNotifications && (
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-alert-500 text-white text-xs flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Mobile notification sheet */}
      {canAccessReportsAlertsNotifications && showNotifications && (
        <div className="md:hidden fixed inset-x-0 top-[3.25rem] z-[35] px-3 max-h-[min(70vh,calc(100vh-5rem))]">
          <div className="rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-xl ring-1 ring-gray-200/70 dark:ring-gray-600/50 overflow-hidden flex flex-col max-h-[min(70vh,calc(100vh-5.5rem))]">
            <div className="p-3 border-b border-gray-100/90 dark:border-gray-700/80 flex justify-between items-center gap-2 shrink-0">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Notifications
              </h3>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  to="/dashboard/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs font-medium text-ocean-600 dark:text-ocean-400 hover:underline"
                >
                  View all
                </Link>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => void markAllAsRead()}
                    className="text-xs font-medium text-eco-600 dark:text-eco-400 hover:text-eco-700 dark:hover:text-eco-300"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
            </div>
            <div className="overflow-y-auto flex-1 min-h-0">
              {dropdownNotifications.length === 0 ? (
                <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                  No unread notifications
                </div>
              ) : (
                dropdownNotifications.map((notif) => (
                  <button
                    type="button"
                    key={notif.id}
                    onClick={() => void markNotificationAsRead(notif)}
                    className={`w-full text-left p-3 border-b border-gray-100/80 dark:border-gray-800/80 last:border-0 hover:bg-gray-50/90 dark:hover:bg-gray-800/80 transition-colors ${
                      !notif.read
                        ? "bg-eco-50/80 dark:bg-eco-950/25"
                        : "bg-transparent"
                    }`}
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                      {notif.title}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-3">
                      {notif.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {notif.timestamp instanceof Date
                        ? notif.timestamp.toLocaleString()
                        : new Date(notif.timestamp).toLocaleString()}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sidebar: full width on mobile drawer; md+ collapsible to icon rail */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 shrink-0 bg-white dark:bg-gray-800 shadow-xl transform transition-all duration-300 ease-in-out md:relative md:translate-x-0 ${
          sidebarCollapsed ? "md:w-20" : "md:w-72"
        } ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Sidebar Header */}
          <div
            className={`flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-5 md:shrink-0 ${
              sidebarCollapsed ? "md:p-3 md:justify-center" : ""
            }`}
          >
            <div
              className={`flex items-center gap-2 min-w-0 ${
                sidebarCollapsed ? "md:justify-center" : ""
              }`}
            >
              <div className="w-8 h-8 shrink-0 rounded-lg bg-linear-to-br from-eco-500 to-ocean-500 flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <div className={sidebarCollapsed ? "md:hidden" : ""}>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  EBA
                </span>
                <span className="text-lg font-bold bg-linear-to-br from-eco-600 to-ocean-600 bg-clip-text text-transparent">
                  {" "}
                  OBSERVA
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-gray-600 dark:text-gray-300 shrink-0"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Info */}
          <div
            className={`border-b border-gray-200 dark:border-gray-700 bg-linear-to-br from-eco-50 to-ocean-50 dark:from-eco-900/20 dark:to-ocean-900/20 p-5 ${
              sidebarCollapsed ? "md:p-3" : ""
            }`}
          >
            <div
              className={`flex items-center ${sidebarCollapsed ? "md:flex-col md:justify-center md:gap-0" : ""}`}
            >
              <div className="h-12 w-12 shrink-0 rounded-full bg-linear-to-br from-eco-500 to-ocean-500 flex items-center justify-center text-white">
                <User size={20} />
              </div>
              <div className={`ml-3 min-w-0 ${sidebarCollapsed ? "md:hidden" : ""}`}>
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user?.username || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || "user@example.com"}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-eco-100 dark:bg-eco-900/50 text-eco-700 dark:text-eco-300">
                  {user?.role || "User"}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className={`flex-1 overflow-y-auto min-h-0 ${sidebarCollapsed ? "md:p-2" : "p-4"}`}>
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    title={item.name}
                    className={`flex items-center rounded-xl transition-all duration-200 group ${
                      sidebarCollapsed
                        ? "px-4 py-3 md:justify-center md:px-2 md:py-3"
                        : "px-4 py-3"
                    } ${
                      location.pathname === item.path
                        ? `bg-linear-to-br from-eco-500/10 to-ocean-500/10 text-eco-600 dark:text-eco-400 ${
                            sidebarCollapsed
                              ? "md:border-r-0 md:ring-2 md:ring-eco-500/35"
                              : "border-r-2 border-eco-500"
                          }`
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <item.icon
                      size={20}
                      className={`shrink-0 ${sidebarCollapsed ? "md:mr-0" : "mr-3"} ${location.pathname === item.path ? "text-eco-500" : "group-hover:text-eco-500"}`}
                    />
                    <span
                      className={`font-medium truncate ${sidebarCollapsed ? "md:hidden" : ""}`}
                    >
                      {item.name}
                    </span>
                  </Link>
                </li>
              ))}

              {/* Admin Dropdown Menu - Only visible to admin/manager */}
              {isAdmin && (
                <li className={`mt-2 ${sidebarCollapsed ? "relative" : ""}`}>
                  <button
                    type="button"
                    onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                    title="Administration"
                    className={`w-full flex items-center rounded-xl transition-all duration-200 group ${
                      sidebarCollapsed
                        ? "justify-between px-4 py-3 md:justify-center md:px-2 md:py-3"
                        : "justify-between px-4 py-3"
                    } ${
                      adminItems.some((item) => location.pathname === item.path)
                        ? `bg-linear-to-br from-eco-500/10 to-ocean-500/10 text-eco-600 dark:text-eco-400 ${
                            sidebarCollapsed
                              ? "md:border-r-0 md:ring-2 md:ring-eco-500/35"
                              : "border-r-2 border-eco-500"
                          }`
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MoreHorizontal size={20} className="shrink-0" />
                      <span
                        className={`font-medium ${sidebarCollapsed ? "md:hidden" : ""}`}
                      >
                        More
                      </span>
                    </div>
                    <span className={sidebarCollapsed ? "md:hidden" : ""}>
                      {adminMenuOpen ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronRight size={18} />
                      )}
                    </span>
                  </button>

                  {adminMenuOpen && (
                    <ul
                      className={
                        sidebarCollapsed
                          ? "ml-6 mt-1 space-y-1 border-l-2 border-eco-200 dark:border-eco-800 md:absolute md:left-full md:top-0 md:z-[60] md:ml-1 md:mt-0 md:min-w-50 md:rounded-xl md:border md:border-gray-200 md:dark:border-gray-700 md:bg-white md:dark:bg-gray-800 md:py-1 md:shadow-lg md:space-y-0.5 md:border-l-0"
                          : "ml-6 mt-1 space-y-1 border-l-2 border-eco-200 dark:border-eco-800"
                      }
                    >
                      {adminItems.map((item) => (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            title={item.name}
                            onClick={() => setAdminMenuOpen(false)}
                            className={`flex items-center rounded-lg transition-all duration-200 ${
                              sidebarCollapsed
                                ? "px-4 py-2.5 md:px-3 md:py-2"
                                : "px-4 py-2.5"
                            } ${
                              location.pathname === item.path
                                ? "text-eco-600 dark:text-eco-400 bg-eco-50 dark:bg-eco-900/20"
                                : "text-gray-600 dark:text-gray-400 hover:text-eco-600 dark:hover:text-eco-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                          >
                            <item.icon
                              size={16}
                              className={`shrink-0 ${sidebarCollapsed ? "mr-2" : "mr-3"}`}
                            />
                            <span className="text-sm truncate">{item.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              )}
            </ul>
          </nav>

          {/* Logout Button */}
          <div
            className={`border-t border-gray-200 dark:border-gray-700 shrink-0 ${
              sidebarCollapsed ? "md:p-2" : "p-4"
            }`}
          >
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoading}
              title="Log out"
              className={`flex items-center w-full rounded-xl text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group ${
                sidebarCollapsed
                  ? "px-4 py-3 md:justify-center md:px-2 md:py-3"
                  : "px-4 py-3"
              }`}
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin mr-3 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut
                    size={20}
                    className={`shrink-0 group-hover:text-red-500 transition-colors ${sidebarCollapsed ? "md:mr-0" : "mr-3"}`}
                  />
                  <span className={sidebarCollapsed ? "md:hidden" : ""}>Logout</span>
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {mobileSidebarOpen && (
        <div
          className={`fixed inset-0 z-40 md:hidden ${modalBackdropClass}`}
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="hidden md:flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="flex items-center">
            <button
              type="button"
              onClick={toggleSidebarCollapsed}
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="mr-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
            >
              {sidebarCollapsed ? (
                <ChevronsRight size={20} />
              ) : (
                <ChevronsLeft size={20} />
              )}
            </button>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {currentPage}
            </h1>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Notifications (managers + admins only) */}
            {canAccessReportsAlertsNotifications && (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-alert-500 text-white text-xs flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-[min(100vw-2rem,22rem)] rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-xl ring-1 ring-gray-200/70 dark:ring-gray-600/50 z-50 overflow-hidden flex flex-col max-h-[min(24rem,70vh)]">
                  <div className="p-3 border-b border-gray-100/90 dark:border-gray-700/80 flex justify-between items-center gap-2 shrink-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to="/dashboard/notifications"
                        onClick={() => setShowNotifications(false)}
                        className="text-xs font-medium text-ocean-600 dark:text-ocean-400 hover:underline"
                      >
                        View all
                      </Link>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() => void markAllAsRead()}
                          className="text-xs font-medium text-eco-600 dark:text-eco-400 hover:text-eco-700 dark:hover:text-eco-300"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="overflow-y-auto flex-1 min-h-0">
                    {dropdownNotifications.length === 0 ? (
                      <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
                        No unread notifications
                      </div>
                    ) : (
                      dropdownNotifications.map((notif) => (
                        <button
                          type="button"
                          key={notif.id}
                          onClick={() => void markNotificationAsRead(notif)}
                          className={`w-full text-left p-3 border-b border-gray-100/80 dark:border-gray-800/80 last:border-0 hover:bg-gray-50/90 dark:hover:bg-gray-800/80 transition-colors ${
                            !notif.read
                              ? "bg-eco-50/80 dark:bg-eco-950/25"
                              : ""
                          }`}
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-3">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {notif.timestamp instanceof Date
                              ? notif.timestamp.toLocaleString()
                              : new Date(notif.timestamp).toLocaleString()}
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
