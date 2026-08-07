export const CREATE_TRACKED_COMICS_TABLE = `
CREATE TABLE IF NOT EXISTS tracked_comics (
  id TEXT PRIMARY KEY NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('issue', 'tpb')),
  status TEXT NOT NULL CHECK (status IN ('backlog', 'reading', 'read')) DEFAULT 'backlog',

  title TEXT NOT NULL,
  series_title TEXT,
  cover_image_url TEXT,
  release_date TEXT,
  author TEXT,
  issue_number TEXT,

  source TEXT NOT NULL CHECK (source IN ('metron', 'openlibrary', 'google_books', 'manual')),
  metron_series_id TEXT,
  metron_issue_id TEXT,
  isbn TEXT,
  scanned_code TEXT,

  date_added TEXT NOT NULL,
  date_read TEXT,
  updated_at TEXT NOT NULL
);
`;
