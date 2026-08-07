import { getGoogleBooksApiKey } from './config';
import type { ComicMatch } from './types';

interface GoogleBooksVolume {
  volumeInfo?: {
    title?: string;
    authors?: string[];
    publishedDate?: string;
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  };
}

interface GoogleBooksResponse {
  totalItems: number;
  items?: GoogleBooksVolume[];
}

/** Upgrades Google's http thumbnail URLs to https to avoid mixed-content issues. */
function secure(url: string | undefined): string | undefined {
  return url?.replace(/^http:\/\//, 'https://');
}

export async function lookupIsbn(isbn: string): Promise<ComicMatch | null> {
  const url = new URL('https://www.googleapis.com/books/v1/volumes');
  url.searchParams.set('q', `isbn:${isbn}`);
  const apiKey = getGoogleBooksApiKey();
  if (apiKey) url.searchParams.set('key', apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Google Books request failed (${response.status})`);
  }

  const data = (await response.json()) as GoogleBooksResponse;
  const volumeInfo = data.items?.[0]?.volumeInfo;
  if (!volumeInfo) return null;

  return {
    type: 'tpb',
    source: 'google_books',
    sourceIds: { isbn },
    title: volumeInfo.title ?? `ISBN ${isbn}`,
    coverImageUrl: secure(volumeInfo.imageLinks?.thumbnail ?? volumeInfo.imageLinks?.smallThumbnail),
    releaseDate: volumeInfo.publishedDate,
    author: volumeInfo.authors?.join(', '),
  };
}
