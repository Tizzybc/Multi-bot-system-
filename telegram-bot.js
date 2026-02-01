import TelegramBot from ‘node-telegram-bot-api’;
import fs from ‘fs’;

class TelegramBotHandler {
constructor(token, database, whatsappManager, mediaDownloader, animeScraper) {
this.bot = new TelegramBot(token, { polling: true });
this.database = database;
this.whatsappManager = whatsappManager;
this.mediaDownloader = mediaDownloader;
this.animeScraper = animeScraper;
this.adminId = process.env.ADMIN_TELEGRAM_ID;

```
this.setupCommands();
```

}

setupCommands() {
// Start command
this.bot.onText(//start/, async (msg) => {
const chatId = msg.chat.id;
await this.database.addTelegramUser(
chatId.toString(),
msg.from.username,
msg.from.first_name
);

```
  const welcomeMessage = `
```

🤖 *Welcome to Multi-Platform Bot!*

*WhatsApp Session Management:*
/newsession <name> - Create new WhatsApp session
/sessions - List all your sessions
/destroysession <name> - Destroy a session

*Media Downloader:*
/dl <url> - Download from social media
Supported: YouTube, Instagram, TikTok, Twitter, Facebook

*Anime Commands:*
/anime <search> - Search anime
/animeid <mal_id> - Get anime by ID
/topanime - Get top anime
/seasonal - Current season anime
/character <name> - Search character

*Admin Broadcast:*
/broadcast <message> - Broadcast to all users (Admin only)

*Other:*
/help - Show this help message
/status - Bot status
`;

```
  this.bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
});

// Help command
this.bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  this.bot.sendMessage(chatId, 'Use /start to see all available commands.');
});

// Create new WhatsApp session
this.bot.onText(/\/newsession (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const sessionName = match[1].trim();

  if (!sessionName) {
    this.bot.sendMessage(chatId, '❌ Please provide a session name.\nExample: /newsession myphone');
    return;
  }

  this.bot.sendMessage(chatId, `🔄 Creating WhatsApp session "${sessionName}"...`);
  
  const result = await this.whatsappManager.createSession(sessionName, chatId.toString());
  
  if (!result.success) {
    this.bot.sendMessage(chatId, `❌ ${result.message}`);
  }
});

// List sessions
this.bot.onText(/\/sessions/, async (msg) => {
  const chatId = msg.chat.id;
  const sessions = await this.database.getSessionByTelegramId(chatId.toString());

  if (sessions.length === 0) {
    this.bot.sendMessage(chatId, '📱 You have no active WhatsApp sessions.\nUse /newsession to create one.');
    return;
  }

  let message = '📱 *Your WhatsApp Sessions:*\n\n';
  sessions.forEach((session, index) => {
    message += `${index + 1}. ${session.session_name}\n`;
    message += `   Status: ${session.is_active ? '✅ Active' : '❌ Inactive'}\n`;
    message += `   Created: ${new Date(session.created_at).toLocaleDateString()}\n\n`;
  });

  this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

// Destroy session
this.bot.onText(/\/destroysession (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const sessionName = match[1].trim();

  const result = await this.whatsappManager.destroySession(sessionName);
  
  if (result) {
    this.bot.sendMessage(chatId, `✅ Session "${sessionName}" destroyed.`);
  } else {
    this.bot.sendMessage(chatId, `❌ Session "${sessionName}" not found.`);
  }
});

// Media download
this.bot.onText(/\/dl (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const url = match[1].trim();

  const platform = this.mediaDownloader.detectPlatform(url);
  
  if (platform === 'unknown') {
    this.bot.sendMessage(chatId, '❌ Unsupported platform. Supported: YouTube, Instagram, TikTok, Twitter, Facebook');
    return;
  }

  this.bot.sendMessage(chatId, `🔄 Downloading from ${platform}...`);

  const result = await this.mediaDownloader.download(url);

  if (result.success) {
    try {
      await this.bot.sendVideo(chatId, result.filepath, {
        caption: `✅ Downloaded from ${result.platform}`
      });
      
      // Clean up file after sending
      setTimeout(() => {
        this.mediaDownloader.cleanupFile(result.filepath);
      }, 5000);
    } catch (error) {
      this.bot.sendMessage(chatId, `❌ Error sending file: ${error.message}`);
      this.mediaDownloader.cleanupFile(result.filepath);
    }
  } else {
    this.bot.sendMessage(chatId, `❌ Download failed: ${result.error}`);
  }
});

// Anime search
this.bot.onText(/\/anime (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const query = match[1].trim();

  this.bot.sendMessage(chatId, '🔍 Searching anime...');

  const result = await this.animeScraper.searchAnime(query);
  const message = this.animeScraper.formatSearchResults(result);

  this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

// Anime by ID
this.bot.onText(/\/animeid (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const malId = match[1].trim();

  this.bot.sendMessage(chatId, '🔍 Fetching anime details...');

  const result = await this.animeScraper.getAnimeById(malId);

  if (result.success) {
    const message = this.animeScraper.formatAnimeMessage(result);
    
    if (result.image) {
      this.bot.sendPhoto(chatId, result.image, {
        caption: message,
        parse_mode: 'Markdown'
      });
    } else {
      this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    }
  } else {
    this.bot.sendMessage(chatId, `❌ ${result.error}`);
  }
});

// Top anime
this.bot.onText(/\/topanime/, async (msg) => {
  const chatId = msg.chat.id;
  this.bot.sendMessage(chatId, '🔍 Fetching top anime...');

  const result = await this.animeScraper.getTopAnime('tv', 10);
  const message = this.animeScraper.formatSearchResults(result);

  this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

// Seasonal anime
this.bot.onText(/\/seasonal/, async (msg) => {
  const chatId = msg.chat.id;
  this.bot.sendMessage(chatId, '🔍 Fetching current season anime...');

  const result = await this.animeScraper.getCurrentSeason();
  const message = this.animeScraper.formatSearchResults(result);

  this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

// Character search
this.bot.onText(/\/character (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const name = match[1].trim();

  this.bot.sendMessage(chatId, '🔍 Searching character...');

  const result = await this.animeScraper.searchCharacter(name);

  if (result.success && result.results.length > 0) {
    let message = '🔍 *Character Search Results:*\n\n';
    
    result.results.forEach((char, index) => {
      message += `${index + 1}. *${char.name}*\n`;
      message += `   ❤️ Favorites: ${char.favorites || 'N/A'}\n`;
      message += `   ID: ${char.malId}\n\n`;
    });

    this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } else {
    this.bot.sendMessage(chatId, '❌ No characters found.');
  }
});

// Admin broadcast
this.bot.onText(/\/broadcast (.+)/, async (msg, match) => {
  const chatId = msg.chat.id;

  if (chatId.toString() !== this.adminId) {
    this.bot.sendMessage(chatId, '❌ This command is only available to admins.');
    return;
  }

  const message = match[1];

  this.bot.sendMessage(chatId, '📢 Broadcasting message...');

  // Broadcast to Telegram users
  const telegramUsers = await this.database.getAllSubscribedTelegramUsers();
  let telegramCount = 0;
  
  for (const user of telegramUsers) {
    try {
      await this.bot.sendMessage(user.telegram_id, `📢 *Broadcast Message:*\n\n${message}`, {
        parse_mode: 'Markdown'
      });
      telegramCount++;
    } catch (error) {
      console.error(`Error sending to Telegram user ${user.telegram_id}:`, error);
    }
  }

  // Broadcast to WhatsApp users
  await this.whatsappManager.broadcastToWhatsApp(`📢 Broadcast Message:\n\n${message}`);

  this.bot.sendMessage(
    chatId,
    `✅ Broadcast sent!\n📊 Telegram: ${telegramCount} users\n📱 WhatsApp: Processing...`
  );
});

// Bot status
this.bot.onText(/\/status/, async (msg) => {
  const chatId = msg.chat.id;
  const sessions = this.whatsappManager.getAllSessions();
  
  const message = `
```

🤖 *Bot Status*

📱 WhatsApp Sessions: ${sessions.length}
Active Sessions: ${sessions.join(’, ’) || ‘None’}

✅ All systems operational
`;

```
  this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

console.log('✅ Telegram bot commands initialized');
```

}

getBot() {
return this.bot;
}
}

export default TelegramBotHandler;
