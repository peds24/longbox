import type { TrackedComic } from '@/types/comic';

import { compareIssueNumbers, sortByIssueNumber } from './issue-number';
import { getIssue, getIssuesForSeries, issueDetailToComicMatch } from './metron';
import { NoSeriesLinkError, type ComicMatch } from './types';

export async function getNextIssue(comic: TrackedComic): Promise<ComicMatch | null> {
  if (!comic.metronSeriesId) {
    throw new NoSeriesLinkError();
  }

  const issues = await getIssuesForSeries(comic.metronSeriesId);
  const sorted = sortByIssueNumber(issues, (issue) => issue.number);

  const currentIndex = comic.metronIssueId
    ? sorted.findIndex((issue) => String(issue.id) === comic.metronIssueId)
    : sorted.findIndex((issue) => compareIssueNumbers(issue.number, comic.issueNumber) === 0);

  const next = currentIndex >= 0 ? sorted[currentIndex + 1] : undefined;
  if (!next) return null;

  return issueDetailToComicMatch(await getIssue(next.id));
}
