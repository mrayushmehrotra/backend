import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { connectDB } from "./lib/db.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 5000; // Fallback to port 5000 if PORT is not set
const __dirname = path.resolve();

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173", // Local development
  "https://chatty-indol.vercel.app", // Hosted frontend
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Required for cookies/sessions
  })
);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Server is working fine" });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

// Production setup
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Start server
server.listen(PORT, () => {
  console.log("Server is running on PORT: " + PORT);
  connectDB();
});
