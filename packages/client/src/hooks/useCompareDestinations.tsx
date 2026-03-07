import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export interface CompareDestinationCandidate {
  id: string;
  city: string;
  country: string;
  continent: string;
  imageUrl: string | null;
}

interface CompareContextValue {
  selected: CompareDestinationCandidate[];
  selectedIds: string[];
  isSelected: (destinationId: string) => boolean;
  canAddMore: boolean;
  addDestination: (destination: CompareDestinationCandidate) => boolean;
  removeDestination: (destinationId: string) => void;
  toggleDestination: (destination: CompareDestinationCandidate) => {
    changed: boolean;
    selected: boolean;
    reason?: 'limit_reached';
  };
  clearSelection: () => void;
}

const MAX_COMPARE_DESTINATIONS = 4;
const STORAGE_KEY = 'globesense-compare-selection';

const CompareContext = createContext<CompareContextValue | null>(null);

function sanitizeEntry(value: unknown): CompareDestinationCandidate | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  if (
    typeof raw.id !== 'string' ||
    typeof raw.city !== 'string' ||
    typeof raw.country !== 'string' ||
    typeof raw.continent !== 'string'
  ) {
    return null;
  }

  return {
    id: raw.id,
    city: raw.city,
    country: raw.country,
    continent: raw.continent,
    imageUrl: typeof raw.imageUrl === 'string' ? raw.imageUrl : null,
  };
}

function loadStoredSelection(): CompareDestinationCandidate[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map(sanitizeEntry)
      .filter((entry): entry is CompareDestinationCandidate => !!entry)
      .slice(0, MAX_COMPARE_DESTINATIONS);
  } catch {
    return [];
  }
}

function persistSelection(selection: CompareDestinationCandidate[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selection));
}

export function CompareProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<CompareDestinationCandidate[]>(() => loadStoredSelection());

  useEffect(() => {
    persistSelection(selected);
  }, [selected]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      setSelected(loadStoredSelection());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const isSelected = useCallback(
    (destinationId: string) => selected.some((entry) => entry.id === destinationId),
    [selected],
  );

  const addDestination = useCallback((destination: CompareDestinationCandidate) => {
    let added = false;
    setSelected((previous) => {
      if (previous.some((entry) => entry.id === destination.id)) return previous;
      if (previous.length >= MAX_COMPARE_DESTINATIONS) return previous;
      added = true;
      return [...previous, destination];
    });
    return added;
  }, []);

  const removeDestination = useCallback((destinationId: string) => {
    setSelected((previous) => previous.filter((entry) => entry.id !== destinationId));
  }, []);

  const toggleDestination = useCallback(
    (destination: CompareDestinationCandidate) => {
      if (selected.some((entry) => entry.id === destination.id)) {
        removeDestination(destination.id);
        return { changed: true, selected: false as const };
      }
      if (selected.length >= MAX_COMPARE_DESTINATIONS) {
        return { changed: false, selected: false as const, reason: 'limit_reached' as const };
      }
      addDestination(destination);
      return { changed: true, selected: true as const };
    },
    [addDestination, removeDestination, selected],
  );

  const clearSelection = useCallback(() => {
    setSelected([]);
  }, []);

  const value = useMemo(
    () => ({
      selected,
      selectedIds: selected.map((destination) => destination.id),
      isSelected,
      canAddMore: selected.length < MAX_COMPARE_DESTINATIONS,
      addDestination,
      removeDestination,
      toggleDestination,
      clearSelection,
    }),
    [selected, isSelected, addDestination, removeDestination, toggleDestination, clearSelection],
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompareDestinations() {
  const context = useContext(CompareContext);
  if (!context) {
    throw new Error('useCompareDestinations must be used within CompareProvider');
  }
  return context;
}

export const compareDestinationLimit = MAX_COMPARE_DESTINATIONS;
