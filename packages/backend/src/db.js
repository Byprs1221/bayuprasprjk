import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Resolve DB path relative to the backend package root
const dbPath = path.resolve(__dirname, '..', config.databaseFile);

// Ensure the directory exists
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);

// Improve concurrency/durability behaviour
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Migration: create the users table if it does not exist.
// Runs eagerly at module load so tables exist before any model
// prepares its statements (ESM imports are evaluated top-down).
export function runMigrations() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      name          TEXT    NOT NULL,
      email         TEXT    NOT NULL UNIQUE,
      password_hash TEXT    NOT NULL,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

   CREATE TABLE IF NOT EXISTS revoke_token (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      jti           TEXT    NOT NULL,
      created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_revoke_token_jti ON revoke_token (jti);
  `);
  console.log('[db] Migrations applied.');
}

// Apply migrations immediately when the DB module is first imported.
runMigrations();
