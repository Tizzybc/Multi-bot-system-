# Multi-Platform Bot (WhatsApp + Telegram)

A comprehensive bot system that integrates WhatsApp and Telegram with multiple sessions, media downloading, anime scraping, status viewing, auto-reactions, and admin broadcasting capabilities.

## Features

### 🔐 WhatsApp Multi-Session Support

- Create and manage multiple WhatsApp sessions from Telegram
- QR code authentication sent directly to Telegram
- Session persistence across restarts
- Individual session management

### 📱 Cross-Platform Integration

- Seamless WhatsApp and Telegram integration
- Unified command interface
- Cross-platform broadcasting

### 👁️ Status Features

- Automatic status viewing (targeted)
- Status view logging
- Auto-reaction to statuses (configurable)

### 📢 Admin Broadcasting

- Broadcast messages from admin Telegram to:
  - All Telegram subscribers
  - All WhatsApp users across all sessions
- Support for text and media broadcasts

### 🎌 Anime Scraper

- Search anime by name
- Get anime details by MAL ID
- Top anime lists
- Current seasonal anime
- Character search
- Anime recommendations
- Powered by Jikan API (MyAnimeList)

### 📥 Social Media Downloader

Supports downloading from:

- YouTube
- Instagram
- TikTok
- Twitter/X
- Facebook

## Installation

### Prerequisites

- Node.js 18+
- Python 3.8+ (for yt-dlp)
- Git

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd whatsapp-telegram-bot

# Install Node.js dependencies
npm install

# Install yt-dlp for media downloading
pip install yt-dlp

# Or on Ubuntu/Debian
sudo apt install yt-dlp
```

### Step 2: Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```env
# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
ADMIN_TELEGRAM_ID=your_telegram_user_id

# Server Configuration
PORT=3000

# Database
DB_PATH=./database.sqlite

# Session Configuration
SESSIONS_PATH=./sessions

# Auto React Configuration
AUTO_REACT_ENABLED=true
DEFAULT_REACTION=❤️
```

### Step 3: Get Your Credentials

#### Telegram Bot Token:

1. Open Telegram and search for `@BotFather`
1. Send `/newbot` and follow the instructions
1. Copy the bot token

#### Admin Telegram ID:

1. Search for `@userinfobot` on Telegram
1. Send `/start`
1. Copy your user ID

### Step 4: Run the Bot

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

## Usage

### Telegram Commands

#### Session Management

```
/newsession <name>     - Create a new WhatsApp session
/sessions              - List all your WhatsApp sessions  
/destroysession <name> - Destroy a WhatsApp session
```

Example:

```
/newsession myphone
/newsession workphone
/sessions
/destroysession myphone
```

#### Media Downloader

```
/dl <url>              - Download media from social platforms
```

Supported platforms:

- YouTube: `/dl https://youtube.com/watch?v=...`
- Instagram: `/dl https://instagram.com/p/...`
- TikTok: `/dl https://tiktok.com/@user/video/...`
- Twitter: `/dl https://twitter.com/user/status/...`
- Facebook: `/dl https://facebook.com/...`

#### Anime Commands

```
/anime <search>        - Search for anime
/animeid <mal_id>      - Get anime details by MyAnimeList ID
/topanime              - Get top anime list
/seasonal              - Get current season anime
/character <name>      - Search for anime character
```

Examples:

```
/anime naruto
/animeid 1735
/topanime
/seasonal
/character luffy
```

#### Admin Commands (Admin Only)

```
/broadcast <message>   - Broadcast to all Telegram and WhatsApp users
/status                - Check bot status
```

Example:

```
/broadcast Hello everyone! This is a test broadcast message.
```

#### WhatsApp Commands

Send these messages in WhatsApp:

```
!dl <url>              - Download media
!download <url>        - Download media (alternative)
!anime <search>        - Search anime
```

## Architecture

```
┌─────────────────┐
│  Telegram Bot   │
│   (Commands)    │
└────────┬────────┘
         │
         ├─────────────────┐
         │                 │
         ▼                 ▼
┌─────────────────┐  ┌─────────────────┐
│   WhatsApp      │  │  Media          │
│ Session Manager │  │  Downloader     │
│  (Multi-Session)│  └─────────────────┘
└────────┬────────┘
         │
         ▼
┌─────────────────┐  ┌─────────────────┐
│   Database      │  │  Anime          │
│   (SQLite)      │  │  Scraper        │
└─────────────────┘  └─────────────────┘
```

## Database Schema

### Tables:

- `whatsapp_sessions` - WhatsApp session information
- `telegram_users` - Telegram user subscriptions
- `whatsapp_users` - WhatsApp user subscriptions
- `status_views` - Status view tracking

## Features Breakdown

### Multi-Session WhatsApp

Each user can create multiple WhatsApp sessions with unique names. Each session:

- Has its own authentication
- Stores messages independently
- Can be managed separately
- Persists across bot restarts

### Status Viewing & Auto-React

- Automatically views WhatsApp statuses from configured contacts
- Logs all status views to database
- Optional auto-reaction to statuses
- Configurable reaction emoji

### Admin Broadcasting

Admin can broadcast to all users:

1. Send `/broadcast Your message here` from Telegram
1. Message is sent to:
- All subscribed Telegram users
- All WhatsApp users across all active sessions

### Anime Integration

Powered by Jikan API (unofficial MyAnimeList API):

- Real-time anime data
- No API key required
- Comprehensive anime information
- Character databases
- Seasonal anime tracking

### Media Downloader

Uses yt-dlp for robust downloading:

- Supports major social platforms
- Automatic format selection
- Quality optimization
- Error handling and retry logic

## File Structure

```
whatsapp-telegram-bot/
├── index.js                 # Main entry point
├── database.js              # Database management
├── whatsapp-manager.js      # WhatsApp session manager
├── telegram-bot.js          # Telegram bot handler
├── media-downloader.js      # Social media downloader
├── anime-scraper.js         # Anime scraper
├── package.json             # Dependencies
├── .env.example             # Environment template
├── README.md                # This file
├── sessions/                # WhatsApp session data (auto-created)
├── downloads/               # Downloaded media (auto-created)
└── database.sqlite          # SQLite database (auto-created)
```

## Troubleshooting

### WhatsApp Session Issues

```bash
# If a session fails to load, try:
1. Delete the session folder in ./sessions/
2. Create a new session with /newsession
3. Scan the QR code again
```

### Media Download Fails

```bash
# Install/update yt-dlp:
pip install --upgrade yt-dlp

# Or via apt:
sudo apt update
sudo apt install yt-dlp
```

### Database Locked

```bash
# Stop the bot and remove the lock:
rm database.sqlite-journal
npm start
```

## Security Notes

⚠️ **Important Security Considerations:**

1. Never commit `.env` file to git
1. Keep your `TELEGRAM_BOT_TOKEN` private
1. Restrict admin commands to trusted users only
1. Review broadcast messages before sending
1. Sessions folder contains sensitive data - keep it secure

## API Rate Limits

- **Jikan API**: 3 requests per second, 60 per minute
- **Telegram**: 30 messages per second
- **WhatsApp**: Recommended 20 messages per minute per session

## Advanced Configuration

### Custom Reactions

Edit `.env`:

```env
AUTO_REACT_ENABLED=true
DEFAULT_REACTION=🔥  # Change emoji
```

### Multiple Admins

Modify `telegram-bot.js` to support multiple admin IDs:

```javascript
const adminIds = ['123456789', '987654321'];
if (!adminIds.includes(chatId.toString())) { ... }
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this for personal or commercial projects.

## Support

For issues and questions:

1. Check the Troubleshooting section
1. Review the error logs
1. Open an issue on GitHub

## Roadmap

- [ ] Web dashboard for session management
- [ ] Message scheduling
- [ ] Group management features
- [ ] Analytics and statistics
- [ ] Custom command aliases
- [ ] Multi-language support
- [ ] Voice message support
- [ ] Automated responses

-----

**Made with ❤️ for multi-platform communication**
