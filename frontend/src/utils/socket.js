import { io } from "socket.io-client";

const getSocketUrl = () => {
  if (process.env.REACT_APP_SOCKET_URL) {
    return process.env.REACT_APP_SOCKET_URL;
  }
  
  // Fallback: try to derive from API URL if available
  if (process.env.REACT_APP_API_URL) {
    try {
      const url = new URL(process.env.REACT_APP_API_URL);
      return url.origin;
    } catch (e) {
      console.warn("Invalid REACT_APP_API_URL for socket connection:", e);
    }
  }

  return "http://localhost:5001";
};

const SOCKET_URL = getSocketUrl();
export const socket = io(SOCKET_URL, { autoConnect: true });
