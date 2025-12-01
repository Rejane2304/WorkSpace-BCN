import { Server } from "socket.io";

let io = null;

export function initSocket(server) {
  io = new Server(server, {
    cors: { origin: "*" }
  });
  io.on("connection", (socket) => {
    console.log("Socket.io: user connected");
  });
  return io;
}

export function getIO() {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}
