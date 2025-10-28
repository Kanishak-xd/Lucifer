import express from "express";
import axios from "axios";
import jwt from "jsonwebtoken";

const router = express.Router();

// Redirect user to Discord OAuth2
// GET /auth/discord/
router.get("/", (req, res) => {
  const redirectUrl = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    process.env.DISCORD_REDIRECT_URI
  )}&response_type=code&scope=identify%20guilds`;

  res.redirect(redirectUrl);
});

// Handle Discord callback (when user approves)
// GET /auth/discord/callback
router.get("/callback", async (req, res) => {
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

    // Fetch user's guilds (servers)
    const guildsResponse = await axios.get("https://discord.com/api/users/@me/guilds", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    let guilds = guildsResponse.data;

    // Filter guilds where bot is present AND user is owner/admin
    const filteredGuilds = [];
    for (const guild of guilds) {
      try {
        // Check if the bot is a member of the guild
        await axios.get(
          `https://discord.com/api/guilds/${guild.id}/members/${process.env.DISCORD_CLIENT_ID}`,
          {
            headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
          }
        );

        // If the above request succeeds, the bot is in the guild.
        // Now, check if the user is an owner or has admin permissions.
        const isAdmin = (parseInt(guild.permissions) & 0x8) === 0x8;
        
        if (guild.owner || isAdmin) {
          filteredGuilds.push(guild);
        }
      } catch (err) {
        // If an error occurs (like a 404), it means the bot is not in this guild.
        // We simply skip to the next guild in the loop.
        continue;
      }
    }
    
    // Create JWT token for frontend with user info and the fully filtered guilds
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        avatar: user.avatar,
        guilds: filteredGuilds,
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

// Get roles for a specific guild
// GET /auth/discord/roles/:guildId
router.get("/roles/:guildId", async (req, res) => {
  try {
    const { guildId } = req.params;
    
    // Fetch roles from Discord API using bot token
    const rolesResponse = await axios.get(
      `https://discord.com/api/guilds/${guildId}/roles`,
      {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
      }
    );

    const roles = rolesResponse.data;
    
    // Filter out @everyone role and return name and id
    const filteredRoles = roles
      .filter(role => role.name !== '@everyone')
      .map(role => ({
        id: role.id,
        name: role.name,
        color: role.color,
      }));

    res.json({ roles: filteredRoles });
  } catch (err) {
    console.error("Error fetching roles:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch roles" });
  }
});

// Get text channels for a specific guild
// GET /auth/discord/channels/:guildId
router.get("/channels/:guildId", async (req, res) => {
  try {
    const { guildId } = req.params;

    const channelsResponse = await axios.get(
      `https://discord.com/api/guilds/${guildId}/channels`,
      {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
      }
    );

    const channels = channelsResponse.data || [];

    console.log(`Fetched ${channels.length} total channels for guild ${guildId}`);

    // Discord channel type 0 = GUILD_TEXT (standard text channels)
    const textChannels = channels
      .filter((ch) => ch?.type === 0)
      .map((ch) => ({ id: ch.id, name: ch.name }));

    console.log(`Returning ${textChannels.length} text channels`);
    res.json({ channels: textChannels });
  } catch (err) {
    console.error("Error fetching channels:", err.response?.data || err.message);
    res.status(500).json({ message: "Failed to fetch channels" });
  }
});

export default router;
