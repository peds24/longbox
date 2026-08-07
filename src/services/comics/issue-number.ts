/**
 * Metron issue numbers are free-form strings ("1", "0", "1.1", "Annual 1").
 * Extract a leading numeric token for sorting; non-numeric numbers sort last.
 */
export function parseIssueNumber(value: string | null | undefined): number {
  if (!value) return Number.POSITIVE_INFINITY;
  const match = value.trim().match(/^-?\d+(\.\d+)?/);
  if (!match) return Number.POSITIVE_INFINITY;
  return parseFloat(match[0]);
}

export function compareIssueNumbers(a: string | null | undefined, b: string | null | undefined): number {
  return parseIssueNumber(a) - parseIssueNumber(b);
}

export function sortByIssueNumber<T>(items: T[], getNumber: (item: T) => string | null | undefined): T[] {
  return [...items].sort((a, b) => compareIssueNumbers(getNumber(a), getNumber(b)));
}
