import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { getJournalEntryById } from '@/api/journal-entries';
import { getQuoteById } from '@/api/quotes';
import { JournalEntry } from '@/components';
import { useTheme } from '@/theme';

export default function EntryDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: entry } = useQuery({
    queryKey: ['journal-entries', id],
    queryFn: () => getJournalEntryById(id),
    enabled: Boolean(id)
  });

  const { data: linkedQuote } = useQuery({
    queryKey: ['quotes', entry?.quoteId],
    queryFn: () => getQuoteById(entry!.quoteId),
    enabled: Boolean(entry?.quoteId)
  });

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
        entry={entry ?? null}
        linkedQuote={linkedQuote ?? null}
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
