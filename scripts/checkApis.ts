/**
 * Standalone sanity check for the comic API service layer — run before touching any
 * React/camera code to isolate network/auth/parsing bugs from UI bugs.
 *
 * Usage: npx tsx scripts/checkApis.ts
 */
import 'dotenv/config';

import { lookupIsbn as lookupIsbnGoogleBooks } from '../src/services/comics/google-books';
import { findIssuesByUpc, getIssue, issueDetailToComicMatch, searchSeries } from '../src/services/comics/metron';
import { lookupIsbn } from '../src/services/comics/open-library';

// Confirmed-present in Metron/OpenLibrary as of this writing (Absolute Batman #1, 2024; Watchmen TPB).
// Swap for the UPC/ISBN off a comic/TPB you actually own if you want to check that specific one.
const KNOWN_UPC = '76194138584600111';
const KNOWN_ISBN = '9781401245252';

async function main() {
  console.log('--- Metron: series search ("Batman") ---');
  const series = await searchSeries('Batman');
  console.log(`Found ${series.length} series. First few:`);
  for (const s of series.slice(0, 5)) {
    console.log(`  #${s.id} ${s.series}`);
  }

  console.log('\n--- Metron: UPC lookup ---');
  const upcMatches = await findIssuesByUpc(KNOWN_UPC);
  console.log(`Found ${upcMatches.length} issue(s) for UPC ${KNOWN_UPC}`);
  for (const summary of upcMatches) {
    const detail = await getIssue(summary.id);
    const match = issueDetailToComicMatch(detail);
    console.log('  ->', match);
  }

  console.log('\n--- OpenLibrary: ISBN lookup ---');
  const book = await lookupIsbn(KNOWN_ISBN);
  console.log(book);

  console.log('\n--- Google Books: ISBN lookup (fallback path) ---');
  console.log(process.env.EXPO_PUBLIC_GOOGLE_BOOKS_API_KEY ? '(using API key)' : '(no API key set — unauthenticated request)');
  const googleBook = await lookupIsbnGoogleBooks(KNOWN_ISBN);
  console.log(googleBook);

  console.log('\nAll checks completed.');
}

main().catch((err) => {
  console.error('Sanity check failed:', err);
  process.exitCode = 1;
});
