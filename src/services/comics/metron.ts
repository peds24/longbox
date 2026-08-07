import base64 from 'base-64';

import { getMetronCredentials } from './config';
import type { ComicMatch } from './types';

const BASE_URL = 'https://metron.cloud/api';

interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface MetronSeriesSummary {
  id: number;
  /** Display name including publication year, e.g. "Absolute Batman (2024)". */
  series: string;
  volume: number;
  year_began: number;
  issue_count?: number;
}

export interface MetronIssueSummary {
  id: number;
  number: string;
  cover_date: string;
  store_date: string | null;
  image: string | null;
}

export interface MetronCredit {
  id: number;
  creator: string;
  role: { id: number; name: string }[];
}

export interface MetronIssueDetail extends MetronIssueSummary {
  series: { id: number; name: string; volume: number; year_began: number };
  credits: MetronCredit[];
  upc: string;
  isbn: string;
  desc: string;
}

async function metronFetch<T>(path: string, params?: Record<string, string>): Promise<T> {
  const { username, password } = getMetronCredentials();
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value) url.searchParams.set(key, value);
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Basic ${base64.encode(`${username}:${password}`)}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Metron request failed (${response.status}) for ${url.pathname}`);
  }

  return (await response.json()) as T;
}

export async function searchSeries(name: string): Promise<MetronSeriesSummary[]> {
  const data = await metronFetch<Paginated<MetronSeriesSummary>>('/series/', { name });
  return data.results;
}

export async function getIssuesForSeries(seriesId: string | number): Promise<MetronIssueSummary[]> {
  const data = await metronFetch<Paginated<MetronIssueSummary> | MetronIssueSummary[]>(
    `/series/${seriesId}/issue_list/`
  );
  return Array.isArray(data) ? data : data.results;
}

export async function findIssuesByUpc(upc: string): Promise<MetronIssueSummary[]> {
  const data = await metronFetch<Paginated<MetronIssueSummary>>('/issue/', { upc });
  return data.results;
}

export async function getIssue(issueId: string | number): Promise<MetronIssueDetail> {
  return metronFetch<MetronIssueDetail>(`/issue/${issueId}/`);
}

function creditsToAuthor(credits: MetronCredit[] | undefined): string | undefined {
  if (!credits || credits.length === 0) return undefined;
  const writers = credits.filter((c) => c.role?.some((r) => r.name?.toLowerCase().includes('writer')));
  const pool = writers.length > 0 ? writers : credits;
  const names = Array.from(new Set(pool.map((c) => c.creator))).filter(Boolean);
  return names.length > 0 ? names.join(', ') : undefined;
}

export function issueDetailToComicMatch(issue: MetronIssueDetail): ComicMatch {
  return {
    type: 'issue',
    source: 'metron',
    sourceIds: {
      metronSeriesId: String(issue.series.id),
      metronIssueId: String(issue.id),
    },
    title: `${issue.series.name} #${issue.number}`,
    seriesTitle: issue.series.name,
    issueNumber: issue.number,
    coverImageUrl: issue.image ?? undefined,
    releaseDate: issue.store_date ?? issue.cover_date ?? undefined,
    author: creditsToAuthor(issue.credits),
    description: issue.desc || undefined,
  };
}
