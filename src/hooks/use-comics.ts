import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { getComics } from '@/db/repository';
import type { ComicStatus, TrackedComic } from '@/types/comic';

export type ComicsFilter = ComicStatus | 'all';

export function useComicsList(status: ComicsFilter) {
  const db = useSQLiteContext();
  const [comics, setComics] = useState<TrackedComic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setComics(await getComics(db, status));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [db, status]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  return { comics, loading, error, refetch };
}
