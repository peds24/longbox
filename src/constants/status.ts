import { Colors, type ThemeColor } from '@/constants/theme';
import type { ComicStatus } from '@/types/comic';

/** The order a comic moves through the box: filed, in hand, finished. */
export const STATUS_ORDER: ComicStatus[] = ['backlog', 'reading', 'read'];

export const STATUS_LABELS: Record<ComicStatus, string> = {
  backlog: 'BACKLOG',
  reading: 'READING',
  read: 'READ',
};

const STATUS_COLORS: Record<ComicStatus, ThemeColor> = {
  backlog: 'textMuted',
  reading: 'accent',
  read: 'success',
};

export function statusColor(status: ComicStatus): string {
  return Colors[STATUS_COLORS[status]];
}
