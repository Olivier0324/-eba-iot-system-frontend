/**
 * Server → client event names (keep aligned with backend `socketEvents.js` / SocketService).
 * Legacy MQTT bridge names are still emitted from index.js for compatibility.
 */
export const SOCKET_EVENTS = {
  SENSOR_DATA: "sensor-data",
  NEW_ALERTS: "new-alerts",
  DEVICE_STATUS: "device-status",
  CONTROL_ACK: "control-ack",
  DEVICE_STARTUP: "device-startup",

  NOTIFICATION_NEW: "notification:new",
  NOTIFICATION_BROADCAST: "notification:broadcast",
  ALERT_UPDATED: "alert:updated",
  NOTIFICATION_PREFERENCES_UPDATED: "notification-preferences:updated",

  CONTROL_INTERVAL_SET: "control:interval-set",
  CONTROL_RESTART_SENT: "control:restart-sent",

  REPORT_GENERATED: "report:generated",
  REPORT_DELETED: "report:deleted",

  CONTACT_MESSAGE_SUBMITTED: "contact:message-submitted",
  CONTACT_MESSAGE_UPDATED: "contact:message-updated",

  USERS_MUTATION: "users:mutation",
  BLOG_MUTATION: "blog:mutation",
};
