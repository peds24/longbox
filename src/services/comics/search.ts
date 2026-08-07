import { sortByIssueNumber } from './issue-number';
import { getIssue, getIssuesForSeries, issueDetailToComicMatch, searchSeries, type MetronSeriesSummary } from './metron';
import type { ComicMatch } from './types';

export async function searchByTitle(query: string): Promise<MetronSeriesSummary[]> {
  return searchSeries(query);
}

export async function resolveFirstIssue(seriesId: number): Promise<ComicMatch> {
  const issues = await getIssuesForSeries(seriesId);
  if (issues.length === 0) {
    throw new Error('This series has no issues in Metron yet.');
  }
  const [first] = sortByIssueNumber(issues, (issue) => issue.number);
  return issueDetailToComicMatch(await getIssue(first.id));
}
