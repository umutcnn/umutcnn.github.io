/** localStorage wrapper that never throws (private mode, blocked storage, SSR). */
export const storage = {
  get(key: string): string | null {
    try {
      return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set(key: string, value: string): void {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* storage unavailable — preference simply is not persisted */
    }
  },
};

export const STORAGE_KEYS = {
  theme: 'ucy.theme',
  locale: 'ucy.locale',
} as const;
