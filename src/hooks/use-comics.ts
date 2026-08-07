import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState } from 'react';

import { getRead, getReading } from '@/db/repository';
import type { TrackedComic } from '@/types/comic';

export function useComicsList(status: 'reading' | 'read') {
  const db = useSQLiteContext();
  const [comics, setComics] = useState<TrackedComic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = status === 'reading' ? await getReading(db) : await getRead(db);
      setComics(rows);
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
