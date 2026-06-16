import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

// Recreate __filename and __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const db = new Database(path.join(__dirname, "../../finance.db"));

// Enable WAL mode for better performance
db.pragma("journal_mode = WAL");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    description TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL,
    date TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Expense queries
export const expenseQueries = {
  insert: db.prepare(`
    INSERT INTO expenses (description, amount, category, date)
    VALUES (@description, @amount, @category, @date)
  `),

  getAll: db.prepare(`
    SELECT * FROM expenses ORDER BY date DESC
  `),

  getByCategory: db.prepare(`
    SELECT category, SUM(amount) as total, COUNT(*) as count
    FROM expenses
    GROUP BY category
    ORDER BY total DESC
  `),

  getMonthly: db.prepare(`
    SELECT 
      strftime('%Y-%m', date) as month,
      SUM(amount) as total,
      COUNT(*) as count
    FROM expenses
    GROUP BY month
    ORDER BY month DESC
  `),

  getTotalSpend: db.prepare(`
    SELECT SUM(amount) as total FROM expenses
  `),

  deleteAll: db.prepare(`DELETE FROM expenses`),

  deleteById: db.prepare(`DELETE FROM expenses WHERE id = ?`),
};

// Conversation queries
export const conversationQueries = {
  insert: db.prepare(`
    INSERT INTO conversations (role, content)
    VALUES (@role, @content)
  `),

  getRecent: db.prepare(`
    SELECT role, content FROM conversations
    ORDER BY created_at ASC
    LIMIT 20
  `),

  clearAll: db.prepare(`DELETE FROM conversations`),
};

export default db;
