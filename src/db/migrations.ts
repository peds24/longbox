import type { SQLiteDatabase } from 'expo-sqlite';

import { CREATE_TRACKED_COMICS_TABLE } from './schema';

const DATABASE_VERSION = 3;

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
    currentDbVersion = 3;
  }

  // SQLite can't ALTER a CHECK constraint or a column DEFAULT in place, so every constraint
  // change is a table rebuild: rename the old table aside, create the current schema, copy
  // rows across. Column order has never changed, which is what makes `SELECT *` safe here.
  //
  //   v1 -> v2: the source CHECK didn't allow 'google_books'.
  //   v2 -> v3: the status CHECK didn't allow 'backlog', and the default was 'reading'.
  //
  // Both land on the same current schema, so one rebuild covers a v1 database too.
  if (currentDbVersion === 1 || currentDbVersion === 2) {
    await db.execAsync(`
      ALTER TABLE tracked_comics RENAME TO tracked_comics_old;
      ${CREATE_TRACKED_COMICS_TABLE}
      INSERT INTO tracked_comics SELECT * FROM tracked_comics_old;
      DROP TABLE tracked_comics_old;
    `);
    currentDbVersion = 3;
  }

  await db.execAsync(`PRAGMA user_version = ${currentDbVersion}`);
}
