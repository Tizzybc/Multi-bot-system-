import sqlite3 from ‘sqlite3’;
import { promisify } from ‘util’;

const sqlite = sqlite3.verbose();

class Database {
constructor(dbPath) {
this.db = new sqlite.Database(dbPath);
this.run = promisify(this.db.run.bind(this.db));
this.get = promisify(this.db.get.bind(this.db));
this.all = promisify(this.db.all.bind(this.db));
}

async initialize() {
await this.run(`CREATE TABLE IF NOT EXISTS whatsapp_sessions ( id INTEGER PRIMARY KEY AUTOINCREMENT, session_name TEXT UNIQUE NOT NULL, telegram_user_id TEXT NOT NULL, is_active BOOLEAN DEFAULT 1, created_at DATETIME DEFAULT CURRENT_TIMESTAMP )`);

```
await this.run(`
  CREATE TABLE IF NOT EXISTS telegram_users (
    telegram_id TEXT PRIMARY KEY,
    username TEXT,
    first_name TEXT,
    subscribed BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

await this.run(`
  CREATE TABLE IF NOT EXISTS whatsapp_users (
    phone_number TEXT PRIMARY KEY,
    session_name TEXT,
    subscribed BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_name) REFERENCES whatsapp_sessions(session_name)
  )
`);

await this.run(`
  CREATE TABLE IF NOT EXISTS status_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_name TEXT,
    status_id TEXT,
    viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_name) REFERENCES whatsapp_sessions(session_name)
  )
`);

console.log('✅ Database initialized');
```

}

async addWhatsAppSession(sessionName, telegramUserId) {
try {
await this.run(
‘INSERT INTO whatsapp_sessions (session_name, telegram_user_id) VALUES (?, ?)’,
[sessionName, telegramUserId]
);
return true;
} catch (error) {
console.error(‘Error adding session:’, error);
return false;
}
}

async getActiveSessions() {
return await this.all(‘SELECT * FROM whatsapp_sessions WHERE is_active = 1’);
}

async getSessionByTelegramId(telegramId) {
return await this.all(‘SELECT * FROM whatsapp_sessions WHERE telegram_user_id = ?’, [telegramId]);
}

async addTelegramUser(userId, username, firstName) {
try {
await this.run(
‘INSERT OR REPLACE INTO telegram_users (telegram_id, username, first_name) VALUES (?, ?, ?)’,
[userId, username, firstName]
);
} catch (error) {
console.error(‘Error adding telegram user:’, error);
}
}

async getAllSubscribedTelegramUsers() {
return await this.all(‘SELECT * FROM telegram_users WHERE subscribed = 1’);
}

async getAllSubscribedWhatsAppUsers() {
return await this.all(‘SELECT * FROM whatsapp_users WHERE subscribed = 1’);
}

async logStatusView(sessionName, statusId) {
await this.run(
‘INSERT INTO status_views (session_name, status_id) VALUES (?, ?)’,
[sessionName, statusId]
);
}
}

export default Database;
