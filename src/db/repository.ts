import type { SQLiteDatabase } from 'expo-sqlite';

import type { ComicMatch } from '@/services/comics/types';
import type { ComicStatus, TrackedComic } from '@/types/comic';

interface TrackedComicRow {
  id: string;
  type: string;
  status: string;
  title: string;
  series_title: string | null;
  cover_image_url: string | null;
  release_date: string | null;
  author: string | null;
  issue_number: string | null;
  source: string;
  metron_series_id: string | null;
  metron_issue_id: string | null;
  isbn: string | null;
  scanned_code: string | null;
  date_added: string;
  date_read: string | null;
  updated_at: string;
}

function rowToComic(row: TrackedComicRow): TrackedComic {
  return {
    id: row.id,
    type: row.type as TrackedComic['type'],
    status: row.status as ComicStatus,
    title: row.title,
    seriesTitle: row.series_title ?? undefined,
    coverImageUrl: row.cover_image_url ?? undefined,
    releaseDate: row.release_date ?? undefined,
    author: row.author ?? undefined,
    issueNumber: row.issue_number ?? undefined,
    source: row.source as TrackedComic['source'],
    metronSeriesId: row.metron_series_id ?? undefined,
    metronIssueId: row.metron_issue_id ?? undefined,
    isbn: row.isbn ?? undefined,
    scannedCode: row.scanned_code ?? undefined,
    dateAdded: row.date_added,
    dateRead: row.date_read ?? undefined,
    updatedAt: row.updated_at,
  };
}

/**
 * Read comics sort by when they were read; everything else by when it was filed.
 * COALESCE keeps rows with a NULL date_read (possible for anything moved back out
 * of 'read' in an older build) from sorting above genuinely recent reads.
 */
function orderClause(status: ComicStatus | 'all'): string {
  return status === 'read' ? 'ORDER BY COALESCE(date_read, date_added) DESC' : 'ORDER BY date_added DESC';
}

export async function getComics(db: SQLiteDatabase, status: ComicStatus | 'all'): Promise<TrackedComic[]> {
  const rows =
    status === 'all'
      ? await db.getAllAsync<TrackedComicRow>(`SELECT * FROM tracked_comics ${orderClause(status)}`)
      : await db.getAllAsync<TrackedComicRow>(
          `SELECT * FROM tracked_comics WHERE status = ? ${orderClause(status)}`,
          status
        );
  return rows.map(rowToComic);
}

export async function getComic(db: SQLiteDatabase, id: string): Promise<TrackedComic | null> {
  const row = await db.getFirstAsync<TrackedComicRow>('SELECT * FROM tracked_comics WHERE id = ?', id);
  return row ? rowToComic(row) : null;
}

export async function insertComic(
  db: SQLiteDatabase,
  match: ComicMatch,
  scannedCode?: string,
  status: ComicStatus = 'backlog'
): Promise<string> {
  const id = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO tracked_comics (
      id, type, status, title, series_title, cover_image_url, release_date, author, issue_number,
      source, metron_series_id, metron_issue_id, isbn, scanned_code, date_added, date_read, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, ?)`,
    id,
    match.type,
    status,
    match.title,
    match.seriesTitle ?? null,
    match.coverImageUrl ?? null,
    match.releaseDate ?? null,
    match.author ?? null,
    match.issueNumber ?? null,
    match.source,
    match.sourceIds.metronSeriesId ?? null,
    match.sourceIds.metronIssueId ?? null,
    match.sourceIds.isbn ?? null,
    scannedCode ?? null,
    now,
    now
  );

  return id;
}

/** Moving a comic out of 'read' clears date_read, so it can't claim a read date it no longer has. */
export async function setStatus(db: SQLiteDatabase, id: string, status: ComicStatus): Promise<void> {
  const now = new Date().toISOString();
  await db.runAsync(
    'UPDATE tracked_comics SET status = ?, date_read = ?, updated_at = ? WHERE id = ?',
    status,
    status === 'read' ? now : null,
    now,
    id
  );
}

export async function deleteComic(db: SQLiteDatabase, id: string): Promise<void> {
  await db.runAsync('DELETE FROM tracked_comics WHERE id = ?', id);
}
