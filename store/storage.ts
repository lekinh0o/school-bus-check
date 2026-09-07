import type { Storage } from 'redux-persist';

const memory = new Map<string, string>();

const memoryStorage: Storage = {
  getItem: (key) => Promise.resolve(memory.get(key) ?? null),
  setItem: (key, value) => {
    memory.set(key, value);
    return Promise.resolve();
  },
  removeItem: (key) => {
    memory.delete(key);
    return Promise.resolve();
  },
};

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(fallback), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch(() => {
        clearTimeout(timer);
        resolve(fallback);
      });
  });
}

type AsyncStorageLike = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
};

function getAsyncStorage(): AsyncStorageLike {
  const mod = require('@react-native-async-storage/async-storage') as {
    default?: AsyncStorageLike;
  } & Partial<AsyncStorageLike>;
  const storage = mod.default ?? mod;
  if (!storage.getItem || !storage.setItem || !storage.removeItem) {
    throw new Error('AsyncStorage indisponível');
  }
  return storage as AsyncStorageLike;
}

function canUseNativeAsyncStorage() {
  const isReactNative =
    typeof navigator !== 'undefined' && navigator.product === 'ReactNative';
  const isBrowser = typeof window !== 'undefined';
  return isReactNative || isBrowser;
}

/**
 * Adapter de persistência. Troque a implementação (ex.: MMKV)
 * sem alterar store.ts nem os slices.
 *
 * Operações sempre resolvem (timeout) para o PersistGate não travar no Android.
 */
function createStorage(): Storage {
  if (!canUseNativeAsyncStorage()) {
    return memoryStorage;
  }

  return {
    getItem: (key) => {
      try {
        const AsyncStorage = getAsyncStorage();
        return withTimeout(Promise.resolve(AsyncStorage.getItem(key)), 2000, null);
      } catch {
        return Promise.resolve(null);
      }
    },
    setItem: (key, value) => {
      try {
        const AsyncStorage = getAsyncStorage();
        return withTimeout(Promise.resolve(AsyncStorage.setItem(key, value)), 2000, undefined);
      } catch {
        return Promise.resolve();
      }
    },
    removeItem: (key) => {
      try {
        const AsyncStorage = getAsyncStorage();
        return withTimeout(Promise.resolve(AsyncStorage.removeItem(key)), 2000, undefined);
      } catch {
        return Promise.resolve();
      }
    },
  };
}

export const storage: Storage = createStorage();
