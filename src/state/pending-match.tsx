import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import type { ComicMatch } from '@/services/comics/types';

interface PendingMatchState {
  matches: ComicMatch[];
  scannedCode?: string;
  setPending: (matches: ComicMatch[], scannedCode?: string) => void;
  clear: () => void;
}

const PendingMatchContext = createContext<PendingMatchState | null>(null);

export function PendingMatchProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<ComicMatch[]>([]);
  const [scannedCode, setScannedCode] = useState<string | undefined>(undefined);

  const value = useMemo<PendingMatchState>(
    () => ({
      matches,
      scannedCode,
      setPending: (nextMatches, nextScannedCode) => {
        setMatches(nextMatches);
        setScannedCode(nextScannedCode);
      },
      clear: () => {
        setMatches([]);
        setScannedCode(undefined);
      },
    }),
    [matches, scannedCode]
  );

  return <PendingMatchContext.Provider value={value}>{children}</PendingMatchContext.Provider>;
}

export function usePendingMatch() {
  const ctx = useContext(PendingMatchContext);
  if (!ctx) {
    throw new Error('usePendingMatch must be used within a PendingMatchProvider');
  }
  return ctx;
}
