const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const morgan = require("morgan");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const chatRoutes = require("./routes/chatRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const sessionRoutes = require("./routes/sessionRoutes");
const { notFoundHandler, errorHandler } = require("./middleware/errorMiddleware");
const registerSockets = require("./sockets");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

const io = new Server(server, {
  cors: {
    origin: clientUrl,
    credentials: true
  }
});

app.use(helmet());
app.use(cors({ origin: clientUrl, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(mongoSanitize());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "Skill Exchange Platform" });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/sessions", sessionRoutes);

registerSockets(io);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Skill Exchange API running on port ${PORT}`);
});
