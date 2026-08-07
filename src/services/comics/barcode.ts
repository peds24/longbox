import { findIssuesByUpc, getIssue, issueDetailToComicMatch } from './metron';
import { lookupIsbn } from './open-library';
import type { BarcodeResolution, ComicMatch } from './types';

export function isIsbn(code: string): boolean {
  return /^97[89]\d{10}$/.test(code);
}

export async function resolveBarcode(scannedCode: string): Promise<BarcodeResolution> {
  const code = scannedCode.trim();

  if (isIsbn(code)) {
    const match = await lookupIsbn(code);
    if (!match) return { status: 'unresolved', scannedCode: code };
    return { status: 'resolved', scannedCode: code, matches: [match] };
  }

  const summaries = await findIssuesByUpc(code);
  if (summaries.length === 0) {
    // Metron has no UPC match — fall back to OpenLibrary in case this code is
    // also indexed as a book identifier (e.g. some collected editions/variants).
    const fallback = await lookupIsbn(code).catch(() => null);
    if (!fallback) return { status: 'unresolved', scannedCode: code };
    return { status: 'resolved', scannedCode: code, matches: [fallback] };
  }

  const matches: ComicMatch[] = await Promise.all(
    summaries.map(async (summary) => issueDetailToComicMatch(await getIssue(summary.id)))
  );

  return { status: 'resolved', scannedCode: code, matches };
}
