export type ComicType = 'issue' | 'tpb';
export type ComicStatus = 'reading' | 'read';
export type ComicSource = 'metron' | 'openlibrary' | 'manual';

export interface TrackedComic {
  id: string;
  type: ComicType;
  status: ComicStatus;

  title: string;
  seriesTitle?: string;
  coverImageUrl?: string;
  releaseDate?: string;
  author?: string;
  issueNumber?: string;

  source: ComicSource;
  metronSeriesId?: string;
  metronIssueId?: string;
  isbn?: string;
  scannedCode?: string;

  dateAdded: string;
  dateRead?: string;
  updatedAt: string;
}
