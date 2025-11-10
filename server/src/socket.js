const socketIO = require("socket.io");
const jwt = require("jsonwebtoken");

let io;
const users = new Map(); // userId -> socketId

function initSocket(server) {
  io = socketIO(server, {
    cors: {
      origin: process.env.SOCKETIO_CORS_ORIGIN || "http://localhost:4000",
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error("Authentication error"));
      }
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.userId);
    users.set(socket.userId, socket.id);

    // Send online status to all
    io.emit("user-online", socket.userId);

    socket.on("send-message", async (data) => {
      const { receiverId, message } = data;
      const receiverSocketId = users.get(receiverId);

      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receive-message", {
          senderId: socket.userId,
          message,
          timestamp: new Date(),
        });
      }
    });

    socket.on("typing", (data) => {
      const receiverSocketId = users.get(data.receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("user-typing", {
          userId: socket.userId,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.userId);
      users.delete(socket.userId);
      io.emit("user-offline", socket.userId);
    });
  });

  return io;
}

function getIO() {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
}

module.exports = { initSocket, getIO };
