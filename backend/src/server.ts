import express, { Express } from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db";

// Import routes
import authRoutes from "./routes/auth.routes";
import userRoutes from "./routes/user.routes";
import knowledgeRoutes from "./routes/knowledge.routes";
import handoverRoutes from "./routes/handover.routes";
import spofRoutes from "./routes/spof.routes";

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

// Initialize express
const app: Express = express();
const PORT: number = parseInt(process.env.PORT || "5000", 10);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);
app.use(helmet()); // Security headers
app.use(morgan("dev")); // Logging
app.use(limiter); // Rate limiting

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/knowledge", knowledgeRoutes);
app.use("/api/handovers", handoverRoutes);
app.use("/api/spof", spofRoutes);

// Health check
app.get("/health", (req, res) => {
  res
    .status(200)
    .json({ status: "OK", message: "TribeTransfer API is running" });
});

// Error handling for unmatched routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (err: Error) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});
