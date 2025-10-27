import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  discordId: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
  },
  // Array of uploads
  uploads: [
    {
      serverId: { type: String, required: true },
      serverName: { type: String, required: true },
      fileUrl: { type: String, required: true },
      uploadedAt: { type: Date, default: Date.now },
    },
  ],
  // Meal schedules for each server
  mealSchedules: [
    {
      serverId: { type: String, required: true },
      roleId: { type: String },
      roleName: { type: String },
      breakfast: { type: String },
      lunch: { type: String },
      snacks: { type: String },
      dinner: { type: String },
      updatedAt: { type: Date, default: Date.now },
    },
  ],
});

const User = mongoose.model("User", UserSchema);

export default User;
