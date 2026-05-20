import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { getQuoteById } from '@/api/quotes';
import { JournalEntry } from '@/components';
import { useTheme } from '@/theme';

export default function NewEntryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { quoteId } = useLocalSearchParams<{ quoteId?: string }>();

  const { data: linkedQuote } = useQuery({
    queryKey: ['quotes', quoteId],
    queryFn: () => getQuoteById(quoteId!),
    enabled: Boolean(quoteId)
  });

  // JournalEntry flips into composer mode when entry.id === 'new'. userId
  // isn't known on the client — it's set on the server from the session.
  const draft = {
    id: 'new',
    quoteId: quoteId ?? '',
    userId: '',
    content: ''
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
        linkedQuote={linkedQuote ?? null}
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
