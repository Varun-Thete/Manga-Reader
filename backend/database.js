import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

export async function openDb() {
  if (db) return db;

  db = await open({
    filename: './library.db',
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS series (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      path TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS comics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      series_id INTEGER,
      path TEXT NOT NULL UNIQUE,
      file_name TEXT NOT NULL,
      cover_image TEXT,
      page_count INTEGER DEFAULT 0,
      current_page INTEGER DEFAULT 0,
      FOREIGN KEY (series_id) REFERENCES series (id)
    );
  `);

  return db;
}