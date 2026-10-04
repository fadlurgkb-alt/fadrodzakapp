'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from 'react';
import { useSearchParams } from 'next/navigation';

interface SearchContextValue {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  clearSearch: () => void;
  isSearching: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  focusSearch: () => void;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

export function SearchProvider({
  children,
  initialQuery = '',
}: {
  children: ReactNode;
  initialQuery?: string;
}) {
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get('q') || initialQuery || '';

  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  const [searchQuery, setSearchQueryState] = useState<string>(urlQuery);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sesuaikan state saat urlQuery berubah dari navigasi luar (pola resmi React)
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    setSearchQueryState(urlQuery);
  }

  // Fungsi pengubah query sekaligus memperbarui URL query string secara halus
  const setSearchQuery = useCallback(
    (newQuery: string) => {
      setSearchQueryState(newQuery);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          if (newQuery.trim()) {
            url.searchParams.set('q', newQuery.trim());
          } else {
            url.searchParams.delete('q');
          }
          // Perbarui URL browser tanpa memicu server fetch berulang
          window.history.replaceState({}, '', url.toString());
        }
      }, 250);
    },
    []
  );

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.delete('q');
      window.history.replaceState({}, '', url.toString());
    }
  }, [setSearchQuery]);

  const focusSearch = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  // Pintasan Keyboard Global: Tekan tombol '/' atau 'Cmd/Ctrl + K' untuk fokus ke pencarian
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Abaikan jika user sedang mengetik di input, textarea, atau contenteditable
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable);

      if (
        (e.key === '/' && !isInput) ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k')
      ) {
        e.preventDefault();
        focusSearch();
      }

      if (e.key === 'Escape' && isInput && target === inputRef.current) {
        if (searchQuery) {
          clearSearch();
        } else {
          inputRef.current?.blur();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusSearch, searchQuery, clearSearch]);

  const value: SearchContextValue = {
    searchQuery,
    setSearchQuery,
    clearSearch,
    isSearching: searchQuery.trim().length > 0,
    inputRef,
    focusSearch,
  };

  return (
    <SearchContext.Provider value={value}>{children}</SearchContext.Provider>
  );
}

export function useSearch(): SearchContextValue {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
