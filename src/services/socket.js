// src/services/socket.js
import { io } from "socket.io-client";

let socket = null;

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "https://eba-iot-system-backend.vercel.app";

/** `VITE_ENABLE_SOCKET=0` — skip Socket.IO entirely (no /socket.io requests, no 404 spam in DevTools). */
function isSocketClientEnabled() {
  const v = import.meta.env.VITE_ENABLE_SOCKET?.trim().toLowerCase();
  return v !== "0" && v !== "false" && v !== "off";
}

export const connectSocket = (token) => {
  if (!isSocketClientEnabled()) {
    disconnectSocket();
    return null;
  }

  if (socket?.connected) {
    return socket;
  }

  if (socket) {
    disconnectSocket();
  }

  socket = io(SOCKET_URL, {
    path: "/socket.io",
    auth: { token },
    transports: ["websocket"],
    upgrade: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 10000,
    timeout: 20000,
  });

  // 404 / CORS on every poll shows once per error; stop retrying after first failure to limit console noise.
  socket.once("connect_error", () => {
    try {
      socket?.io?.reconnection(false);
    } catch {
      /* ignore */
    }
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
};
