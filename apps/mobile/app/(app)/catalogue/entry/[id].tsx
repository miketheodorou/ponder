import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { JournalEntry } from '@/components';
import { ENTRIES, QUOTES } from '@/data/quotes';
import { useTheme } from '@/theme';

export default function EntryDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const entry = ENTRIES[id] ?? null;
  const linkedQuote = entry
    ? (QUOTES.find((q) => q.id === entry.quoteId) ?? null)
    : null;

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.backgroundRaised
        }
      ]}
    >
      <JournalEntry
        entry={entry}
        linkedQuote={linkedQuote}
        onBack={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  }
});
