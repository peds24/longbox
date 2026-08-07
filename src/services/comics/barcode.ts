import * as googleBooks from './google-books';
import { findIssuesByUpc, getIssue, issueDetailToComicMatch } from './metron';
import * as openLibrary from './open-library';
import type { BarcodeResolution, ComicMatch } from './types';

export function isIsbn(code: string): boolean {
  return /^97[89]\d{10}$/.test(code);
}

/** Tries OpenLibrary first, then Google Books if OpenLibrary doesn't have it. */
async function lookupIsbnAnywhere(isbn: string): Promise<ComicMatch | null> {
  const fromOpenLibrary = await openLibrary.lookupIsbn(isbn).catch(() => null);
  if (fromOpenLibrary) return fromOpenLibrary;
  return googleBooks.lookupIsbn(isbn).catch(() => null);
}

export async function resolveBarcode(scannedCode: string): Promise<BarcodeResolution> {
  const code = scannedCode.trim();

  if (isIsbn(code)) {
    const match = await lookupIsbnAnywhere(code);
    if (!match) return { status: 'unresolved', scannedCode: code };
    return { status: 'resolved', scannedCode: code, matches: [match] };
  }

  const summaries = await findIssuesByUpc(code);
  if (summaries.length === 0) {
    // Metron has no UPC match — fall back to the book APIs in case this code is
    // also indexed as a book identifier (e.g. some collected editions/variants).
    const fallback = await lookupIsbnAnywhere(code);
    if (!fallback) return { status: 'unresolved', scannedCode: code };
    return { status: 'resolved', scannedCode: code, matches: [fallback] };
  }

  const matches: ComicMatch[] = await Promise.all(
    summaries.map(async (summary) => issueDetailToComicMatch(await getIssue(summary.id)))
  );

  return { status: 'resolved', scannedCode: code, matches };
}
