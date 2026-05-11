import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { JournalEntry } from '@/components';
import { type JournalEntry as JournalEntryData, QUOTES } from '@/data/quotes';
import { useTheme } from '@/theme';

export default function NewEntryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { quoteId } = useLocalSearchParams<{ quoteId?: string }>();

  const linkedQuote = quoteId
    ? (QUOTES.find((q) => q.id === quoteId) ?? null)
    : null;

  // The JournalEntry component switches into composer mode when entry.id === "new".
  const draft: JournalEntryData = {
    id: 'new',
    quoteId: quoteId ?? '',
    date: 'New entry',
    body: ''
  };

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
        entry={draft}
        linkedQuote={linkedQuote}
        onBack={() => router.back()}
        onSave={() => router.back()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  }
});
