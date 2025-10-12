import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

import cors from "cors";
import axios from "axios";
import jwt from "jsonwebtoken";

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

app.get("/", (req, res) => {
  res.send("Backend running");
});

// ===== DISCORD AUTH ROUTES =====

// Step 1: Redirect user to Discord OAuth2
app.get("/auth/discord", (req, res) => {
  const redirectUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    process.env.DISCORD_REDIRECT_URI
  )}&response_type=code&scope=identify%20guilds`;

  res.redirect(redirectUrl);
});

// Step 2: Handle Discord callback (when user approves)
app.get("/auth/discord/callback", async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send("No code provided");

  try {
    // Exchange authorization code for access token
    const tokenResponse = await axios.post(
      "https://discord.com/api/oauth2/token",
      new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.DISCORD_REDIRECT_URI,
      }),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token } = tokenResponse.data;

    // Fetch user info from Discord
    const userResponse = await axios.get("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const user = userResponse.data;

    // Create JWT token for frontend
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Redirect back to frontend with JWT token in URL
    res.redirect(
      `${process.env.FRONTEND_URL}/auth/success?token=${token}`
    );
  } catch (err) {
    console.error("OAuth error:", err.response?.data || err.message);
    res.status(500).send("Authentication failed");
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Backend running @${PORT}`));