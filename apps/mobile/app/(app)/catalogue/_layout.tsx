import { Stack, useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChevronDown } from '@/components';
import { useTheme } from '@/theme';

export default function CatalogueLayout() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.backgroundRaised
        }
      ]}
    >
      <View style={styles.dismissRow}>
        <Pressable
          onPress={() => router.dismiss()}
          accessibilityRole='button'
          accessibilityLabel='Close catalogue'
          hitSlop={16}
          style={styles.dismissButton}
        >
          <ChevronDown size={theme.icon.sm} color={theme.colors.textMuted} />
        </Pressable>
      </View>

      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.backgroundRaised }
        }}
      >
        <Stack.Screen name='index' />
        <Stack.Screen name='quote/[id]' />
        <Stack.Screen name='entry/[id]' />
        <Stack.Screen name='entry/new' />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  dismissRow: {
    alignItems: 'center',
    paddingTop: 16
  },
  dismissButton: {
    paddingVertical: 8,
    paddingHorizontal: 12
  }
});
