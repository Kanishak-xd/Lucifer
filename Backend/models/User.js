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
  // You can add more fields here as your application grows
  // For example, storing guilds, roles, or other app-specific data
});

const User = mongoose.model("User", UserSchema);

export default User;
