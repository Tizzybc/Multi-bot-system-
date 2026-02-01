import dotenv from ‘dotenv’;
import express from ‘express’;
import Database from ‘./database.js’;
import WhatsAppSessionManager from ‘./whatsapp-manager.js’;
import TelegramBotHandler from ‘./telegram-bot.js’;
import MediaDownloader from ‘./media-downloader.js’;
import AnimeScraper from ‘./anime-scraper.js’;

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.TELEGRAM_BOT_TOKEN) {
console.error(‘❌ TELEGRAM_BOT_TOKEN is required in .env file’);
process.exit(1);
}

if (!process.env.ADMIN_TELEGRAM_ID) {
console.error(‘❌ ADMIN_TELEGRAM_ID is required in .env file’);
process.exit(1);
}

// Initialize Express server
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check endpoint
app.get(’/health’, (req, res) => {
res.json({ status: ‘ok’, message: ‘Bot is running’ });
});

// Initialize database
const database = new Database(process.env.DB_PATH || ‘./database.sqlite’);

// Initialize modules
const mediaDownloader = new MediaDownloader();
const animeScraper = new AnimeScraper();

// We need to initialize telegram bot first to pass it to WhatsApp manager
let telegramBot;
let whatsappManager;
let telegramHandler;

async function initializeBot() {
try {
console.log(‘🚀 Starting Multi-Platform Bot…\n’);

```
// Initialize database
await database.initialize();

// Create a temporary telegram bot instance for WhatsApp manager
const TelegramBot = (await import('node-telegram-bot-api')).default;
telegramBot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

// Initialize WhatsApp manager
whatsappManager = new WhatsAppSessionManager(database, telegramBot);

// Initialize Telegram bot handler with all modules
telegramHandler = new TelegramBotHandler(
  process.env.TELEGRAM_BOT_TOKEN,
  database,
  whatsappManager,
  mediaDownloader,
  animeScraper
);

// Load existing sessions
const existingSessions = await database.getActiveSessions();
console.log(`\n📱 Found ${existingSessions.length} existing WhatsApp sessions`);

for (const session of existingSessions) {
  console.log(`   Loading session: ${session.session_name}`);
  try {
    await whatsappManager.createSession(session.session_name, session.telegram_user_id);
  } catch (error) {
    console.error(`   ❌ Failed to load session ${session.session_name}:`, error.message);
  }
}

// Start Express server
app.listen(PORT, () => {
  console.log(`\n✅ Express server running on port ${PORT}`);
});

console.log('\n✅ Bot initialization complete!');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📱 WhatsApp Multi-Session: Ready');
console.log('🤖 Telegram Bot: Ready');
console.log('🎌 Anime Scraper: Ready');
console.log('📥 Media Downloader: Ready');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
```

} catch (error) {
console.error(‘❌ Error initializing bot:’, error);
process.exit(1);
}
}

// Error handlers
process.on(‘unhandledRejection’, (error) => {
console.error(‘Unhandled promise rejection:’, error);
});

process.on(‘uncaughtException’, (error) => {
console.error(‘Uncaught exception:’, error);
});

// Graceful shutdown
process.on(‘SIGINT’, async () => {
console.log(’\n\n🛑 Shutting down gracefully…’);

// Close all WhatsApp sessions
const sessions = whatsappManager.getAllSessions();
for (const sessionName of sessions) {
await whatsappManager.destroySession(sessionName);
}

process.exit(0);
});

// Start the bot
initializeBot();

export { database, whatsappManager, telegramHandler, mediaDownloader, animeScraper };
