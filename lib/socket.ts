import { Server } from "socket.io";

let io: Server | null = null;

export function getIO() {
  if (!io) {
    io = new Server({
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    });

    io.on("connection", (socket) => {
      socket.on("joinRoom", ({ roomId, name }) => {
        socket.join(roomId);
        socket.data.name = name;
        io?.to(roomId).emit("system", `${name} joined room ${roomId}`);
      });

      socket.on("sessionReady", ({ roomId, session }) => {
        io?.to(roomId).emit("sessionStart", session);
      });

      socket.on("submit", ({ roomId, userId, correct }) => {
        io?.to(roomId).emit("scoreUpdate", { userId, correct });
      });

      socket.on("nextBlock", ({ roomId }) => {
        io?.to(roomId).emit("advanceBlock");
      });
    });
  }
  return io;
}
