/**
 * Safe Storage Wrapper
 * @description localStorage wrapper that surfaces errors instead of swallowing them
 */

export interface Storage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export const memoryStorage: Storage = (() => {
  const store = new Map<string, string>();
  return {
    getItem: (key) => (store.has(key) ? (store.get(key) as string) : null),
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    },
  };
})();

export const localStorageAdapter: Storage = {
  getItem: (key) => window.localStorage.getItem(key),
  setItem: (key, value) => {
    window.localStorage.setItem(key, value);
  },
  removeItem: (key) => {
    window.localStorage.removeItem(key);
  },
};

export function createSafeStorage(): Storage {
  if (typeof window === 'undefined' || typeof window.localStorage === 'undefined') {
    return memoryStorage;
  }

  const testKey = '__wt_storage_test__';
  try {
    window.localStorage.setItem(testKey, '1');
    window.localStorage.removeItem(testKey);
    return localStorageAdapter;
  } catch {
    return memoryStorage;
  }
}
