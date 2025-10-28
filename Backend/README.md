# Menu Automation Backend

Node.js backend for the Menu Automation Discord bot.

## Environment Variables

Create a `.env` file in the root of the Backend directory with the following:

```env
# Discord Bot Configuration
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_BOT_TOKEN=your_discord_bot_token
DISCORD_REDIRECT_URI=http://localhost:5000/auth/discord/callback

# Server Configuration
PORT=5000

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Database Configuration
MONGO_URI=mongodb://localhost:27017/menu-automation

# JWT Secret
JWT_SECRET=your_jwt_secret_key
```

## Development

```bash
# Install dependencies
npm install

# Run server
npm start
```

## Deployment

This backend is configured to deploy on Render. See `DEPLOYMENT.md` in the root directory for detailed instructions.

## API Endpoints

- `GET /auth/discord` - Discord OAuth login
- `GET /auth/discord/callback` - Discord OAuth callback
- `GET /auth/discord/roles/:guildId` - Get roles for a guild
- `GET /auth/discord/channels/:guildId` - Get channels for a guild
- `GET /api/uploads/me` - Get user's uploads
- `POST /api/uploads` - Save new upload
- `DELETE /api/uploads/:uploadId` - Delete an upload
- `GET /api/uploads/meal-schedules/:serverId` - Get meal schedule
- `POST /api/uploads/meal-schedules` - Save meal schedule

