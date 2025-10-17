import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import discordAuthRoutes from "./routes/discordAuth.js";
import uploadsRoutes from "./routes/uploads.js";

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// CORS setup - allow frontend to access backend
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection error:", err));

// Routes
app.get("/", (req, res) => {
  res.send("Backend running");
});
// Use the Discord authentication routes
app.use("/auth/discord", discordAuthRoutes);
// Uploads API
app.use("/api/uploads", uploadsRoutes);


// Server start
const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Backend running @${PORT}`));