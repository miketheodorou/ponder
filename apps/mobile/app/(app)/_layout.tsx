import { Stack } from 'expo-router';

import { useTheme } from '@/theme';

export default function AppLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background }
      }}
    >
      <Stack.Screen name='index' />
      <Stack.Screen
        name='catalogue'
        options={{ presentation: 'modal', gestureEnabled: false }}
      />
      <Stack.Screen name='capture' options={{ presentation: 'modal' }} />
      <Stack.Screen
        name='settings'
        options={{
          presentation: 'transparentModal',
          animation: 'none',
          gestureEnabled: false,
          // Lets the home screen below show through our scrim. Without this,
          // the layout's default opaque backgroundColor paints over the home
          // route and the dismiss animation looks like a delay.
          contentStyle: { backgroundColor: 'transparent' }
        }}
      />
    </Stack>
  );
}
