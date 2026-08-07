import type { SQLiteDatabase } from 'expo-sqlite';

import { CREATE_TRACKED_COMICS_TABLE } from './schema';

const DATABASE_VERSION = 2;

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentDbVersion = row?.user_version ?? 0;

  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  if (currentDbVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      ${CREATE_TRACKED_COMICS_TABLE}
    `);
    currentDbVersion = 2;
  }

  if (currentDbVersion === 1) {
    // v1's source CHECK constraint didn't allow 'google_books', and SQLite can't ALTER a
    // CHECK constraint in place — rebuild the table against the current schema and copy rows.
    await db.execAsync(`
      ALTER TABLE tracked_comics RENAME TO tracked_comics_v1;
      ${CREATE_TRACKED_COMICS_TABLE}
      INSERT INTO tracked_comics SELECT * FROM tracked_comics_v1;
      DROP TABLE tracked_comics_v1;
    `);
    currentDbVersion = 2;
  }

  await db.execAsync(`PRAGMA user_version = ${currentDbVersion}`);
}
