export type ComicMatchSource = 'metron' | 'openlibrary' | 'google_books';

export interface ComicMatch {
  type: 'issue' | 'tpb';
  source: ComicMatchSource;
  sourceIds: {
    metronSeriesId?: string;
    metronIssueId?: string;
    isbn?: string;
  };
  title: string;
  seriesTitle?: string;
  issueNumber?: string;
  coverImageUrl?: string;
  releaseDate?: string;
  author?: string;
  description?: string;
}

/** A scanned/searched code could not be matched to anything by Metron. */
export interface UnresolvedBarcodeResult {
  status: 'unresolved';
  scannedCode: string;
}

export interface ResolvedBarcodeResult {
  status: 'resolved';
  scannedCode: string;
  matches: ComicMatch[];
}

export type BarcodeResolution = UnresolvedBarcodeResult | ResolvedBarcodeResult;

export class NoSeriesLinkError extends Error {
  constructor() {
    super('This comic has no linked series, so the next issue cannot be looked up automatically.');
    this.name = 'NoSeriesLinkError';
  }
}

export class MissingCredentialsError extends Error {
  constructor(varName: string) {
    super(`Missing ${varName}. Add it to your .env file before using this feature.`);
    this.name = 'MissingCredentialsError';
  }
}
