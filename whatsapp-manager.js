import pkg from ‘whatsapp-web.js’;
const { Client, LocalAuth } = pkg;
import qrcode from ‘qrcode-terminal’;
import fs from ‘fs’;
import path from ‘path’;

class WhatsAppSessionManager {
constructor(database, telegramBot) {
this.sessions = new Map();
this.database = database;
this.telegramBot = telegramBot;
this.sessionsPath = process.env.SESSIONS_PATH || ‘./sessions’;

```
if (!fs.existsSync(this.sessionsPath)) {
  fs.mkdirSync(this.sessionsPath, { recursive: true });
}
```

}

async createSession(sessionName, telegramUserId) {
if (this.sessions.has(sessionName)) {
return { success: false, message: ‘Session already exists’ };
}

```
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: sessionName,
    dataPath: this.sessionsPath
  }),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

// QR Code generation
client.on('qr', (qr) => {
  console.log(`QR Code for session ${sessionName}:`);
  qrcode.generate(qr, { small: true });
  
  // Send QR to Telegram
  this.telegramBot.sendMessage(
    telegramUserId,
    `🔐 Scan this QR code to connect WhatsApp session: ${sessionName}\n\nWaiting for authentication...`
  );
});

// Ready event
client.on('ready', async () => {
  console.log(`✅ WhatsApp session ${sessionName} is ready!`);
  await this.database.addWhatsAppSession(sessionName, telegramUserId);
  
  this.telegramBot.sendMessage(
    telegramUserId,
    `✅ WhatsApp session "${sessionName}" connected successfully!`
  );
  
  // Setup status monitoring
  this.setupStatusMonitoring(client, sessionName);
});

// Message handler
client.on('message', async (message) => {
  await this.handleWhatsAppMessage(client, message, sessionName);
});

// Disconnected handler
client.on('disconnected', (reason) => {
  console.log(`Session ${sessionName} disconnected:`, reason);
  this.sessions.delete(sessionName);
});

await client.initialize();
this.sessions.set(sessionName, client);

return { success: true, message: 'Session creation started' };
```

}

setupStatusMonitoring(client, sessionName) {
// Monitor for status updates
setInterval(async () => {
try {
if (process.env.AUTO_REACT_ENABLED === ‘true’) {
// Get status updates and auto-view them
const statuses = await client.getState();
// Auto-react logic would go here
// Note: whatsapp-web.js has limitations with status reactions
}
} catch (error) {
console.error(`Status monitoring error for ${sessionName}:`, error);
}
}, 30000); // Check every 30 seconds
}

async handleWhatsAppMessage(client, message, sessionName) {
const body = message.body.toLowerCase();

```
// Media download commands
if (body.startsWith('!dl ') || body.startsWith('!download ')) {
  const url = body.split(' ')[1];
  await this.downloadMedia(client, message, url);
}

// Anime search
if (body.startsWith('!anime ')) {
  const query = body.replace('!anime ', '');
  await this.searchAnime(client, message, query);
}
```

}

async downloadMedia(client, message, url) {
message.reply(‘🔄 Downloading… Please wait.’);
// This will be implemented in the downloader module
}

async searchAnime(client, message, query) {
message.reply(‘🔍 Searching anime… Please wait.’);
// This will be implemented in the anime scraper module
}

async broadcastToWhatsApp(messageText, mediaPath = null) {
const users = await this.database.getAllSubscribedWhatsAppUsers();

```
for (const user of users) {
  const session = this.sessions.get(user.session_name);
  if (session) {
    try {
      const chatId = user.phone_number + '@c.us';
      
      if (mediaPath && fs.existsSync(mediaPath)) {
        const media = MessageMedia.fromFilePath(mediaPath);
        await session.sendMessage(chatId, media, { caption: messageText });
      } else {
        await session.sendMessage(chatId, messageText);
      }
    } catch (error) {
      console.error(`Error broadcasting to ${user.phone_number}:`, error);
    }
  }
}
```

}

getSession(sessionName) {
return this.sessions.get(sessionName);
}

getAllSessions() {
return Array.from(this.sessions.keys());
}

async destroySession(sessionName) {
const client = this.sessions.get(sessionName);
if (client) {
await client.destroy();
this.sessions.delete(sessionName);
return true;
}
return false;
}
}

export default WhatsAppSessionManager;
