const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");
const { conversationKeyFor } = require("../controllers/chatController");

const onlineUsers = new Map();

const registerSockets = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("Missing auth token"));
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error("Invalid user"));
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Socket authorization failed"));
    }
  });

  io.on("connection", async (socket) => {
    const userId = String(socket.user._id);
    onlineUsers.set(userId, socket.id);
    socket.join(userId);

    await User.findByIdAndUpdate(userId, { online: true, lastSeenAt: new Date() });
    io.emit("presence:update", { userId, online: true });

    socket.on("chat:send", async ({ recipientId, body }, callback) => {
      try {
        const message = await Message.create({
          conversationKey: conversationKeyFor(userId, recipientId),
          sender: userId,
          recipient: recipientId,
          body
        });
        await message.populate("sender recipient", "name avatarUrl online lastSeenAt");
        io.to(recipientId).to(userId).emit("chat:message", message);
        callback?.({ ok: true, message });
      } catch (error) {
        callback?.({ ok: false, error: "Message could not be sent" });
      }
    });

    socket.on("chat:typing", ({ recipientId, typing }) => {
      io.to(recipientId).emit("chat:typing", {
        userId,
        typing: Boolean(typing)
      });
    });

    socket.on("call:offer", ({ recipientId, offer }) => {
      io.to(recipientId).emit("call:offer", { from: userId, offer });
    });

    socket.on("call:answer", ({ recipientId, answer }) => {
      io.to(recipientId).emit("call:answer", { from: userId, answer });
    });

    socket.on("call:ice-candidate", ({ recipientId, candidate }) => {
      io.to(recipientId).emit("call:ice-candidate", { from: userId, candidate });
    });

    socket.on("call:end", ({ recipientId }) => {
      io.to(recipientId).emit("call:end", { from: userId });
    });

    socket.on("disconnect", async () => {
      onlineUsers.delete(userId);
      await User.findByIdAndUpdate(userId, { online: false, lastSeenAt: new Date() });
      io.emit("presence:update", { userId, online: false, lastSeenAt: new Date() });
    });
  });
};

module.exports = registerSockets;
