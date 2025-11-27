// src/utils/realtime.js
import { io } from "socket.io-client";

// Fully safe resolver: no import.meta, no process, no bundler assumptions
const REALTIME_URL =
  (typeof window !== "undefined" && window.REACT_APP_REALTIME_URL) ||
  "http://localhost:3001";

const socket = io(REALTIME_URL, {
  autoConnect: true,
  reconnection: true
});

export default socket;
