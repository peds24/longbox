import type { ComicMatch } from './types';

interface OpenLibraryBookData {
  title?: string;
  authors?: { name: string }[];
  publish_date?: string;
  cover?: { small?: string; medium?: string; large?: string };
}

export async function lookupIsbn(isbn: string): Promise<ComicMatch | null> {
  const url = new URL('https://openlibrary.org/api/books');
  url.searchParams.set('bibkeys', `ISBN:${isbn}`);
  url.searchParams.set('format', 'json');
  url.searchParams.set('jscmd', 'data');

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`OpenLibrary request failed (${response.status})`);
  }

  const data = (await response.json()) as Record<string, OpenLibraryBookData>;
  const book = data[`ISBN:${isbn}`];
  if (!book) return null;

  return {
    type: 'tpb',
    source: 'openlibrary',
    sourceIds: { isbn },
    title: book.title ?? `ISBN ${isbn}`,
    coverImageUrl: book.cover?.large ?? book.cover?.medium ?? book.cover?.small,
    releaseDate: book.publish_date,
    author: book.authors?.map((a) => a.name).join(', '),
  };
}
