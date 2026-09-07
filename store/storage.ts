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
 * No SSR do Expo Router não há `window`; usa memória para não travar o PersistGate.
 */
function createStorage(): Storage {
  if (!canUseNativeAsyncStorage()) {
    return memoryStorage;
  }

  // require preguiçoso: o módulo do AsyncStorage acessa `window` no load.
  const AsyncStorage =
    require('@react-native-async-storage/async-storage').default;

  return {
    getItem: (key) => AsyncStorage.getItem(key),
    setItem: (key, value) => AsyncStorage.setItem(key, value),
    removeItem: (key) => AsyncStorage.removeItem(key),
  };
}

export const storage: Storage = createStorage();
