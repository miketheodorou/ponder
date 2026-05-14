import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import * as SystemUI from 'expo-system-ui';
import { useEffect, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import {
  ThemeProvider,
  fontsToLoad,
  toNavigationTheme,
  useAppearance,
  useTheme
} from '@/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <KeyboardProvider>
          <SafeAreaProvider>
            <ThemeProvider>
              <ThemedShell />
            </ThemeProvider>
          </SafeAreaProvider>
        </KeyboardProvider>
      </GestureHandlerRootView>
    </ClerkProvider>
  );
}

function ThemedShell() {
  const theme = useTheme();
  const navigationTheme = useMemo(() => toNavigationTheme(theme), [theme]);
  const { isSignedIn, isLoaded } = useAuth();
  const [fontsLoaded, fontError] = useFonts(fontsToLoad);
  const { ready: appearanceReady } = useAppearance();

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
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
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
