# Railway Deployment Guide

## Fix for “Error creating build plan with Railpack”

1. ✅ `railway.json` - Railway configuration
1. ✅ `nixpacks.toml` - Build configuration
1. ✅ `Procfile` - Start command
1. ✅ Updated `package.json` with engines

## Deployment Steps:

### Option 1: Redeploy (Recommended)

1. In Railway dashboard, click the **three dots** menu
1. Select **“Redeploy”**
1. The build should work now with the new config files

### Option 2: Fresh Deploy

1. Delete the current service in Railway
1. Create a new service
1. Connect your GitHub repo again
1. Railway will detect the new config files

### Option 3: Manual Trigger

1. Make a small commit to trigger rebuild:
   
   ```bash
   git add .
   git commit -m "Add Railway configuration files"
   git push
   ```

## Environment Variables in Railway

Don’t forget to set these in Railway’s Variables tab:

```
TELEGRAM_BOT_TOKEN=your_bot_token_here
ADMIN_TELEGRAM_ID=your_telegram_id_here
PORT=3000
AUTO_REACT_ENABLED=true
DEFAULT_REACTION=❤️
```

## Important Notes for Railway:

### 1. WhatsApp Sessions Issue

⚠️ **WhatsApp sessions won’t persist on Railway** because Railway uses ephemeral storage.

**Solutions:**

- Use Railway’s persistent volumes (paid feature)
- Or use a different hosting solution for WhatsApp (VPS recommended)
- Or use Railway only for Telegram bot features

### 2. Download Storage

Downloads are temporary and will be deleted on restart. This is fine for the bot’s operation.

### 3. SQLite Database

The SQLite database will be lost on restarts unless you:

- Use Railway volumes (paid)
- Switch to PostgreSQL (Railway provides free PostgreSQL)

### 4. For Production WhatsApp Bot:

Consider using:

- **DigitalOcean Droplet** ($6/month)
- **Heroku** with persistent storage
- **AWS EC2** free tier
- **VPS providers** (Contabo, Vultr, Linode)

## Alternative: Deploy Without WhatsApp

If you only want Telegram features on Railway:

1. Comment out WhatsApp code in `index.js`
1. Focus on Telegram bot + anime + media downloader
1. This will work perfectly on Railway’s free tier

## Railway-Optimized package.json

The updated package.json now includes:

```json
"engines": {
  "node": ">=18.0.0",
  "npm": ">=9.0.0"
}
```

This tells Railway which Node version to use.

## Next Steps:

1. **Push these new config files to GitHub**
1. **Redeploy in Railway**
1. **Set environment variables**
1. **Test the deployment**

## If Build Still Fails:

Check the build logs for:

- Missing dependencies
- Python version issues (for yt-dlp)
- Node version mismatch

You can also try changing nixpacks.toml to use Node 20:

```toml
[phases.setup]
nixPkgs = ['nodejs_20', 'python3', 'ffmpeg']
```

## Support

If you continue having issues:

1. Share the full build logs from Railway
1. Check Railway’s status page
1. Try deploying just the Telegram bot first (simpler)

-----

**TIP:** For a production WhatsApp bot, I recommend deploying to a VPS instead of Railway due to session persistence requirements.
