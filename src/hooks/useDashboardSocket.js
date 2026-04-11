// src/hooks/useDashboardSocket.js
import { useEffect } from "react";
import { toast } from "react-toastify";
import { connectSocket, disconnectSocket } from "../services/socket";
import { SOCKET_EVENTS } from "../constants/socketEvents";
import { store } from "../store";
import { api } from "../services/api";

function invalidateTags(tags) {
  store.dispatch(api.util.invalidateTags(tags));
}

/**
 * Dashboard-scoped realtime: sensor stream, alerts, notifications, and RTK cache bumps
 * for staff events (reports, contact, users, blog, control).
 */
export function useDashboardSocket({
  token,
  user,
  setLatestSensorData,
  setLocalRealtime,
  refetchNotifications,
}) {
  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return undefined;
    }

    let socket;
    try {
      socket = connectSocket(token);
    } catch {
      return undefined;
    }

    if (!socket) {
      return undefined;
    }

    const userId = user?._id ?? user?.id;
    if (userId) {
      socket.emit("join-user", String(userId));
    }

    const onSensorData = (data) => {
      if (!data) return;
      setLatestSensorData(data);

      if (data.temperature > 35 || data.co2_ppm > 1000) {
        const newNotification = {
          id: Date.now(),
          title: "Alert: Threshold Exceeded",
          message: `${data.temperature > 35 ? `Temperature at ${data.temperature}°C` : ""} ${data.co2_ppm > 1000 ? `CO\u2082 at ${data.co2_ppm} ppm` : ""}`,
          type: "warning",
          read: false,
          timestamp: new Date(),
          fromApi: false,
        };
        setLocalRealtime((prev) => [newNotification, ...prev].slice(0, 25));
        toast.warning(newNotification.message);
      }
    };

    const onNewAlerts = (alerts) => {
      if (!Array.isArray(alerts)) return;
      invalidateTags(["Alert"]);
      alerts.forEach((alert, idx) => {
        const newNotification = {
          id: `rt-${Date.now()}-${idx}`,
          title: alert.title,
          message: alert.message,
          type: alert.severity,
          read: false,
          timestamp: new Date(),
          fromApi: false,
        };
        setLocalRealtime((prev) => [newNotification, ...prev].slice(0, 25));
        toast.error(alert.title);
      });
    };

    const refreshNotifications = () => {
      invalidateTags(["Notification"]);
      void refetchNotifications?.();
    };

    const bumpDevice = () => invalidateTags(["Device"]);
    const bumpAlert = () => invalidateTags(["Alert"]);
    const bumpReport = () => invalidateTags(["Report"]);
    const bumpContact = () => invalidateTags(["Contact"]);
    const bumpUser = () => invalidateTags(["User"]);
    const bumpBlog = () => invalidateTags(["Blog"]);

    socket.on(SOCKET_EVENTS.SENSOR_DATA, onSensorData);
    socket.on(SOCKET_EVENTS.NEW_ALERTS, onNewAlerts);
    socket.on(SOCKET_EVENTS.DEVICE_STATUS, bumpDevice);
    socket.on(SOCKET_EVENTS.DEVICE_STARTUP, bumpDevice);
    socket.on(SOCKET_EVENTS.CONTROL_ACK, bumpDevice);

    socket.on(SOCKET_EVENTS.NOTIFICATION_NEW, refreshNotifications);
    socket.on(SOCKET_EVENTS.NOTIFICATION_BROADCAST, refreshNotifications);
    socket.on(SOCKET_EVENTS.NOTIFICATION_PREFERENCES_UPDATED, refreshNotifications);

    socket.on(SOCKET_EVENTS.ALERT_UPDATED, bumpAlert);

    socket.on(SOCKET_EVENTS.CONTROL_INTERVAL_SET, bumpDevice);
    socket.on(SOCKET_EVENTS.CONTROL_RESTART_SENT, bumpDevice);

    socket.on(SOCKET_EVENTS.REPORT_GENERATED, bumpReport);
    socket.on(SOCKET_EVENTS.REPORT_DELETED, bumpReport);

    socket.on(SOCKET_EVENTS.CONTACT_MESSAGE_SUBMITTED, bumpContact);
    socket.on(SOCKET_EVENTS.CONTACT_MESSAGE_UPDATED, bumpContact);

    socket.on(SOCKET_EVENTS.USERS_MUTATION, bumpUser);
    socket.on(SOCKET_EVENTS.BLOG_MUTATION, bumpBlog);

    return () => {
      socket.off(SOCKET_EVENTS.SENSOR_DATA, onSensorData);
      socket.off(SOCKET_EVENTS.NEW_ALERTS, onNewAlerts);
      socket.off(SOCKET_EVENTS.DEVICE_STATUS, bumpDevice);
      socket.off(SOCKET_EVENTS.DEVICE_STARTUP, bumpDevice);
      socket.off(SOCKET_EVENTS.CONTROL_ACK, bumpDevice);
      socket.off(SOCKET_EVENTS.NOTIFICATION_NEW, refreshNotifications);
      socket.off(SOCKET_EVENTS.NOTIFICATION_BROADCAST, refreshNotifications);
      socket.off(SOCKET_EVENTS.NOTIFICATION_PREFERENCES_UPDATED, refreshNotifications);
      socket.off(SOCKET_EVENTS.ALERT_UPDATED, bumpAlert);
      socket.off(SOCKET_EVENTS.CONTROL_INTERVAL_SET, bumpDevice);
      socket.off(SOCKET_EVENTS.CONTROL_RESTART_SENT, bumpDevice);
      socket.off(SOCKET_EVENTS.REPORT_GENERATED, bumpReport);
      socket.off(SOCKET_EVENTS.REPORT_DELETED, bumpReport);
      socket.off(SOCKET_EVENTS.CONTACT_MESSAGE_SUBMITTED, bumpContact);
      socket.off(SOCKET_EVENTS.CONTACT_MESSAGE_UPDATED, bumpContact);
      socket.off(SOCKET_EVENTS.USERS_MUTATION, bumpUser);
      socket.off(SOCKET_EVENTS.BLOG_MUTATION, bumpBlog);
      disconnectSocket();
    };
  }, [
    token,
    user?._id,
    user?.id,
    setLatestSensorData,
    setLocalRealtime,
    refetchNotifications,
  ]);
}
