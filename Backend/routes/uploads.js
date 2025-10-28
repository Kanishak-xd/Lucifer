import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : null;
    if (!token) return res.status(401).json({ message: "Missing token" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// Get current user's uploads
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const { id: discordId, username, avatar } = req.user;
    const user = await User.findOneAndUpdate(
      { discordId },
      { $set: { username, avatar } },
      { new: true, upsert: true }
    );
    return res.json({ uploads: user.uploads || [] });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch uploads" });
  }
});

// Save a new upload mapping; enforce single-upload-at-a-time rule
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { id: discordId, username, avatar } = req.user;
    const { serverId, serverName, channelId, channelName, fileUrl } = req.body;

    if (!serverId || !serverName || !fileUrl) {
      return res.status(400).json({ message: "serverId, serverName, fileUrl required" });
    }

    const user = await User.findOneAndUpdate(
      { discordId },
      { $set: { username, avatar } },
      { new: true, upsert: true }
    );

    if (user.uploads && user.uploads.length > 0) {
      return res.status(400).json({ message: "Remove existing upload before uploading a new one" });
    }

    user.uploads.push({ serverId, serverName, channelId: channelId || null, channelName: channelName || null, fileUrl });
    await user.save();
    return res.status(201).json({ uploads: user.uploads });
  } catch (err) {
    return res.status(500).json({ message: "Failed to save upload" });
  }
});

// Remove an upload by id
router.delete("/:uploadId", authMiddleware, async (req, res) => {
  try {
    const { id: discordId } = req.user;
    const { uploadId } = req.params;

    const user = await User.findOne({ discordId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const originalLength = user.uploads.length;
    user.uploads = user.uploads.filter((u) => String(u._id) !== String(uploadId));
    if (user.uploads.length === originalLength) {
      return res.status(404).json({ message: "Upload not found" });
    }
    await user.save();
    return res.json({ uploads: user.uploads });
  } catch (err) {
    return res.status(500).json({ message: "Failed to remove upload" });
  }
});

// Get meal schedule for a server
router.get("/meal-schedules/:serverId", authMiddleware, async (req, res) => {
  try {
    const { id: discordId } = req.user;
    const { serverId } = req.params;

    const user = await User.findOne({ discordId });
    if (!user) return res.status(404).json({ message: "User not found" });

    const mealSchedule = user.mealSchedules.find(s => s.serverId === serverId);
    
    if (mealSchedule) {
      return res.json(mealSchedule);
    } else {
      return res.json(null);
    }
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch meal schedule" });
  }
});

// Save meal schedule for a server
router.post("/meal-schedules", authMiddleware, async (req, res) => {
  try {
    const { id: discordId, username, avatar } = req.user;
    const { serverId, roleId, roleName, breakfast, lunch, snacks, dinner } = req.body;

    if (!serverId) {
      return res.status(400).json({ message: "serverId required" });
    }

    const user = await User.findOneAndUpdate(
      { discordId },
      { $set: { username, avatar } },
      { new: true, upsert: true }
    );

    // Check if meal schedule already exists for this server
    const existingScheduleIndex = user.mealSchedules.findIndex(s => s.serverId === serverId);
    
    const newSchedule = {
      serverId,
      roleId: roleId || null,
      roleName: roleName || null,
      breakfast: breakfast || null,
      lunch: lunch || null,
      snacks: snacks || null,
      dinner: dinner || null,
      updatedAt: new Date(),
    };

    if (existingScheduleIndex !== -1) {
      // Update existing schedule
      user.mealSchedules[existingScheduleIndex] = newSchedule;
    } else {
      // Add new schedule
      user.mealSchedules.push(newSchedule);
    }

    await user.save();
    return res.status(200).json({ message: "Meal schedule saved", mealSchedule: newSchedule });
  } catch (err) {
    return res.status(500).json({ message: "Failed to save meal schedule" });
  }
});

export default router;


