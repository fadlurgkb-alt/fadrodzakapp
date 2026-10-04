'use client';

export interface BookmarkItem {
  id: number;
  judul: string;
  penulis: string;
  kategori: string;
  nomor_bab?: number | null;
  judul_bab?: string | null;
  nama_cerita?: string | null;
  progressPercent: number;
  savedAt: number;
  url?: string;
}

const STORAGE_KEY = 'fadrodzak_rak_buku_v1';

export function getBookmarks(): BookmarkItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isBookmarked(id: number): boolean {
  const list = getBookmarks();
  return list.some((item) => item.id === id);
}

export function toggleBookmark(
  item: Omit<BookmarkItem, 'savedAt' | 'progressPercent'> & {
    progressPercent?: number;
    url?: string;
  }
): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const list = getBookmarks();
    const existingIndex = list.findIndex((b) => b.id === item.id);
    let bookmarked = false;

    if (existingIndex >= 0) {
      list.splice(existingIndex, 1);
      bookmarked = false;
    } else {
      list.unshift({
        ...item,
        url: item.url || `/karya/${item.id}`,
        progressPercent: item.progressPercent ?? 0,
        savedAt: Date.now(),
      });
      bookmarked = true;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('fadrodzak_bookmark_changed'));
    return bookmarked;
  } catch {
    return false;
  }
}

export function updateReadingProgress(id: number, progressPercent: number) {
  if (typeof window === 'undefined') return;
  try {
    const list = getBookmarks();
    const target = list.find((b) => b.id === id);
    if (target) {
      target.progressPercent = Math.min(100, Math.max(target.progressPercent, Math.round(progressPercent)));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('fadrodzak_bookmark_changed'));
    }
  } catch {}
}

export function removeBookmark(id: number) {
  if (typeof window === 'undefined') return;
  try {
    const list = getBookmarks().filter((b) => b.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('fadrodzak_bookmark_changed'));
  } catch {}
}
