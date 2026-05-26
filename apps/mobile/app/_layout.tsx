import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Stack, ThemeProvider as NavigationThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useMemo } from 'react';
import { LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { registerAuthTokenGetter } from '@/api/client';
import { queryClient } from '@/lib/query-client';
import {
  ThemeProvider,
  fontsToLoad,
  toNavigationTheme,
  useAppearance,
  useTheme
} from '@/theme';

SplashScreen.preventAutoHideAsync();

// Suppress a known noisy interaction between expo-router and
// expo-splash-screen on iOS: when the (app) → (auth) tree swap happens
// after sign-out, expo-router internally calls SplashScreen.hideAsync()
// against the freshly-created view controller, which rejects with "No
// native splash screen registered for given view controller". The splash
// is already hidden; this rejection is harmless. We can't .catch upstream
// code, but we can keep the dev-mode red box quiet about it.
LogBox.ignoreLogs([/No native splash screen registered/]);

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <SafeAreaProvider>
              <ThemeProvider>
                <ThemedShell />
              </ThemeProvider>
            </SafeAreaProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function ThemedShell() {
  const theme = useTheme();
  const navigationTheme = useMemo(() => toNavigationTheme(theme), [theme]);
  const { isSignedIn, isLoaded, getToken } = useAuth();
  const [fontsLoaded, fontError] = useFonts(fontsToLoad);
  const { ready: appearanceReady } = useAppearance();

  // Bind Clerk's session token to the API client so authed requests pick
  // up the latest token on every fetch (Clerk handles refresh internally).
  useEffect(() => {
    registerAuthTokenGetter(() => getToken());
  }, [getToken]);

  // Fonts can fall back if they error — we just don't want to block on them
  // forever. Clerk's `isLoaded` has no error sibling; if its init hangs the
  // splash stays up (rare; the token cache covers offline cold starts).
  // Appearance has to be read from AsyncStorage before the first paint so the
  // user never sees the default theme flip to their preference.
  const ready =
    (fontsLoaded || fontError !== null) && isLoaded && appearanceReady;

  // Paint the native window background. This is the surface RN exposes
  // briefly during Stack push animations — without setting it, you see
  // white seams along the edge of the incoming screen.
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.background);
  }, [theme.colors.background]);

  // Single boot gate — fonts AND Clerk both green before we drop the splash
  // and mount a route tree. Until then we render nothing, so the splash
  // remains and the user never sees a blank or wrong-tree flash.
  //
  // hideAsync() can reject with "No native splash screen registered for
  // given view controller" on iOS when called against a non-root view
  // controller (which expo-router creates during route group swaps, e.g.
  // (app) → (auth) after sign-out). The splash is already hidden by then;
  // we swallow the rejection to keep the call fire-and-forget.
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <StatusBar style={theme.scheme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background }
        }}
      >
        <Stack.Protected guard={!isSignedIn}>
          <Stack.Screen name='(auth)' />
        </Stack.Protected>
        <Stack.Protected guard={!!isSignedIn}>
          <Stack.Screen name='(app)' />
        </Stack.Protected>
      </Stack>
    </NavigationThemeProvider>
  );
}
