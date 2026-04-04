// src/components/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../services/reducers/authReducer";
import { useLogoutMutation, useGetAllSensorDataQuery } from "../services/api";
import { toast } from "react-toastify";
import { connectSocket, disconnectSocket } from "../services/socket";
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
  Droplets,
  Thermometer,
  Wind,
  Database,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  BookOpen,
  GraduationCap,
} from "lucide-react";

function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [latestSensorData, setLatestSensorData] = useState(null);
  const [adminMenuOpen, setAdminMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const token = useSelector((state) => state.auth.token);
  const [userLogout, { isLoading }] = useLogoutMutation();
  

  // Fetch latest sensor data
  const { data: sensorData } = useGetAllSensorDataQuery();

  // Update latest sensor data when fetched
  useEffect(() => {
    if (sensorData && Array.isArray(sensorData) && sensorData.length > 0) {
      setLatestSensorData(sensorData[0]);
    }
  }, [sensorData]);

  // Connect to Socket.io on mount
  useEffect(() => {
    if (token) {
      try {
        const socket = connectSocket(token);

        if (user?.id) {
          socket.emit("join-user", user.id);
        }

        socket.on("sensor-data", (data) => {
          console.log("New sensor data:", data);
          setLatestSensorData(data);

          if (data.temperature > 35 || data.co2_ppm > 1000) {
            const newNotification = {
              id: Date.now(),
              title: "Alert: Threshold Exceeded",
              message: `${data.temperature > 35 ? `Temperature at ${data.temperature}°C` : ""} ${data.co2_ppm > 1000 ? `CO₂ at ${data.co2_ppm}ppm` : ""}`,
              type: "warning",
              read: false,
              timestamp: new Date(),
            };
            setNotifications((prev) => [newNotification, ...prev].slice(0, 50));
            setUnreadCount((prev) => prev + 1);
            toast.warning(newNotification.message);
          }
        });

        socket.on("new-alerts", (alerts) => {
          alerts.forEach((alert) => {
            const newNotification = {
              id: Date.now(),
              title: alert.title,
              message: alert.message,
              type: alert.severity,
              read: false,
              timestamp: new Date(),
            };
            setNotifications((prev) => [newNotification, ...prev].slice(0, 50));
            setUnreadCount((prev) => prev + 1);
            toast.error(alert.title);
          });
        });

        socket.on("device-status", (status) => {
          console.log("Device status:", status);
        });

        return () => {
          socket.off("sensor-data");
          socket.off("new-alerts");
          socket.off("device-status");
          disconnectSocket();
        };
      } catch (error) {
        console.error("Socket connection error:", error);
      }
    }
  }, [token, user?.id]);

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
      console.error("Logout error:", error);
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

  const markNotificationAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    setUnreadCount(0);
  };

  const isAdmin = user?.role === "admin";

  // Navigation items
  const navItems = [
    { name: "Overview", path: "/dashboard", icon: LayoutDashboard },
    { name: "Sensor Data", path: "/dashboard/sensors", icon: Database },
    { name: "Reports", path: "/dashboard/reports", icon: FileText },
    { name: "Alerts", path: "/dashboard/alerts", icon: AlertTriangle },
    { name: "Analytics", path: "/dashboard/analytics", icon: BarChart3 },
    { name: "Control Panel", path: "/dashboard/control", icon: Activity },
    { name: "Settings", path: "/dashboard/settings", icon: Settings },
  ];

  // Admin section items
  const adminItems = [
    {
      name: "Contact Messages",
      path: "/dashboard/admin/messages",
      icon: MessageSquare,
    },
    { name: "Blog Management", path: "/dashboard/admin/blog", icon: BookOpen },
    {
      name: "Research Papers",
      path: "/dashboard/admin/research",
      icon: GraduationCap,
    },
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
        <div className="flex items-center gap-2">
          <button
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
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-eco-500 to-ocean-500 flex items-center justify-center">
                <Eye className="w-4 h-4 text-white" />
              </div>
              <div>
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
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden text-gray-600 dark:text-gray-300"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Info */}
          <div className="p-5 border-b border-gray-200 dark:border-gray-700 bg-linear-to-br from-eco-50 to-ocean-50 dark:from-eco-900/20 dark:to-ocean-900/20">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-linear-to-br from-eco-500 to-ocean-500 flex items-center justify-center text-white">
                <User size={20} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {user?.username || "User"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email || "user@example.com"}
                </p>
                <span className="inline-block mt-1 px-2 py-0.5 text-xs rounded-full bg-eco-100 dark:bg-eco-900/50 text-eco-700 dark:text-eco-300">
                  {user?.role || "User"}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
                      location.pathname === item.path
                        ? "bg-linear-to-br from-eco-500/10 to-ocean-500/10 text-eco-600 dark:text-eco-400 border-r-2 border-eco-500"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <item.icon
                      size={20}
                      className={`mr-3 ${location.pathname === item.path ? "text-eco-500" : "group-hover:text-eco-500"}`}
                    />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                </li>
              ))}

              {/* Admin Dropdown Menu - Only visible to admin/manager */}
              {isAdmin && (
                <li className="mt-2">
                  <button
                    onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                      adminItems.some((item) => location.pathname === item.path)
                        ? "bg-linear-to-br from-eco-500/10 to-ocean-500/10 text-eco-600 dark:text-eco-400 border-r-2 border-eco-500"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="w-5 h-5 mr-3 rounded-full bg-eco-100 dark:bg-eco-900/30 flex items-center justify-center">
                        <span className="text-xs text-eco-600">👑</span>
                      </div>
                      <span className="font-medium">Admin Panel</span>
                    </div>
                    {adminMenuOpen ? (
                      <ChevronDown size={18} />
                    ) : (
                      <ChevronRight size={18} />
                    )}
                  </button>

                  {adminMenuOpen && (
                    <ul className="ml-6 mt-1 space-y-1 border-l-2 border-eco-200 dark:border-eco-800">
                      {adminItems.map((item) => (
                        <li key={item.path}>
                          <Link
                            to={item.path}
                            className={`flex items-center px-4 py-2.5 rounded-lg transition-all duration-200 ${
                              location.pathname === item.path
                                ? "text-eco-600 dark:text-eco-400 bg-eco-50 dark:bg-eco-900/20"
                                : "text-gray-600 dark:text-gray-400 hover:text-eco-600 dark:hover:text-eco-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                            }`}
                          >
                            <item.icon size={16} className="mr-3" />
                            <span className="text-sm">{item.name}</span>
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
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleLogout}
              disabled={isLoading}
              className="flex items-center w-full px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 group"
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
                    className="mr-3 group-hover:text-red-500 transition-colors"
                  />
                  Logout
                </>
              )}
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile sidebar */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Topbar */}
        <header className="hidden md:flex items-center justify-between px-6 py-4 bg-white dark:bg-gray-800 shadow-sm z-10">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="mr-4 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {currentPage}
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            {/* Notifications */}
            <div className="relative">
              <button
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
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-eco-600 hover:text-eco-700"
                      >
                        Mark all as read
                      </button>
                    )}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No notifications
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => markNotificationAsRead(notif.id)}
                          className={`p-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            !notif.read ? "bg-eco-50 dark:bg-eco-900/20" : ""
                          }`}
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {notif.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {notif.message}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {new Date(notif.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
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
