import '../global.css';

import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Provider } from 'react-redux';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider } from '@/hooks/useAuth';
import { persistor, store } from '@/store/store';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(auth)',
};

function PersistLoading() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
      <ActivityIndicator size="large" color="#0F6B4D" />
    </View>
  );
}

function PersistBootstrap({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(persistor.getState().bootstrapped);

  useEffect(() => {
    persistor.persist();

    if (persistor.getState().bootstrapped) {
      setReady(true);
      return;
    }

    const unsubscribe = persistor.subscribe(() => {
      if (persistor.getState().bootstrapped) {
        setReady(true);
      }
    });

    const fallback = setTimeout(() => setReady(true), 2500);

    return () => {
      unsubscribe();
      clearTimeout(fallback);
    };
  }, []);

  if (!ready) {
    return <PersistLoading />;
  }

  return children;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <Provider store={store}>
      <PersistBootstrap>
        <AuthProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="vehicles" />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </AuthProvider>
      </PersistBootstrap>
    </Provider>
  );
}
