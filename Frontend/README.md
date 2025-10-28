# Menu Automation Frontend

React + TypeScript + Vite frontend for the Menu Automation Discord bot.

## Environment Variables

Create a `.env` file in the root of the Frontend directory with the following:

```env
# Backend API Base URL
VITE_API_BASE=http://localhost:5000

# Cloudinary Configuration
VITE_CLOUDINARY_UPLOAD_URL=https://api.cloudinary.com/v1_1/your_cloud_name/upload
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Deployment

This frontend is configured to deploy on Vercel.

### Deploying to Vercel:

1. Push your code to GitHub
2. Import your project to [Vercel](https://vercel.com)
3. Set the following environment variables in Vercel dashboard:
   ```
   VITE_API_BASE=https://your-backend-name.onrender.com
   VITE_CLOUDINARY_UPLOAD_URL=https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/upload
   VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
   ```
4. Vercel will automatically detect the framework and deploy
5. Update `FRONTEND_URL` in your Render backend with your Vercel URL
