import path from 'path';
import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import { environment } from './environment';
import { logger } from '../utils/logger';
import { cryptoService } from '../utils/crypto';

type SqliteDb = Database<sqlite3.Database, sqlite3.Statement>;

let dbPromise: Promise<SqliteDb> | null = null;

function resolveSqliteFile(dbUrl: string): string {
  if (dbUrl.startsWith('sqlite:')) {
    const raw = dbUrl.slice('sqlite:'.length);
    if (!raw) {
      return path.resolve(process.cwd(), 'sqlite.db');
    }
    if (path.isAbsolute(raw)) {
      return raw;
    }
    return path.resolve(process.cwd(), raw);
  }
  return path.resolve(process.cwd(), 'sqlite.db');
}

async function seedUsers(db: SqliteDb): Promise<void> {
  const existing = await db.get<{ count: number }>('SELECT COUNT(*) as count FROM users');
  if ((existing?.count || 0) > 0) {
    return;
  }

  const now = new Date().toISOString();
  const demoUsers = [
    { username: 'admin', email: 'admin@example.com', password: 'admin123', role: 'admin' },
    { username: 'user', email: 'user@example.com', password: 'user123', role: 'user' },
    { username: 'premium', email: 'premium@example.com', password: 'premium123', role: 'premium' },
  ] as const;

  for (const u of demoUsers) {
    const hash = await cryptoService.hashPassword(u.password);
    await db.run(
      `INSERT INTO users (id, username, email, password, role, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      cryptoService.generateRandomString(24),
      u.username,
      u.email,
      hash,
      u.role,
      now,
      now
    );
  }

  logger.info('Seeded SQLite users table with demo accounts');
}

export async function initializeDatabase(): Promise<SqliteDb> {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = (async () => {
    const filename = resolveSqliteFile(environment.database.url || 'sqlite:sqlite.db');
    const db = await open({ filename, driver: sqlite3.Database });

    await db.exec('PRAGMA journal_mode = WAL;');
    await db.exec('PRAGMA foreign_keys = ON;');

    await db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('user', 'premium', 'admin')),
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);

    await db.exec(`
      CREATE TABLE IF NOT EXISTS study_materials (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        question TEXT NOT NULL,
        content TEXT NOT NULL,
        summary TEXT NOT NULL,
        diagrams TEXT,
        created_at TEXT NOT NULL,
        processed_at TEXT NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);

    await db.exec('CREATE INDEX IF NOT EXISTS idx_study_materials_user ON study_materials(user_id);');
    await db.exec('CREATE INDEX IF NOT EXISTS idx_study_materials_created ON study_materials(created_at DESC);');

    await seedUsers(db);

    logger.info(`SQLite initialized at ${filename}`);
    return db;
  })();

  return dbPromise;
}

export async function getDb(): Promise<SqliteDb> {
  return initializeDatabase();
}
