import type { CreateJournalEntryInput } from '@ponder/db/validators';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { createJournalEntry } from '@/api/journal-entries';
import { getQuoteById } from '@/api/quotes';
import { JournalEntry } from '@/components';
import { useTheme } from '@/theme';

export default function NewEntryScreen() {
  const router = useRouter();
  const theme = useTheme();
  const queryClient = useQueryClient();
  const { quoteId } = useLocalSearchParams<{ quoteId?: string }>();

  const { data: linkedQuote } = useQuery({
    queryKey: ['quotes', quoteId],
    queryFn: () => getQuoteById(quoteId!),
    enabled: Boolean(quoteId)
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateJournalEntryInput) =>
      createJournalEntry(quoteId!, input),
    onSuccess: () => {
      if (quoteId) {
        // The linked quote's detail caches `journalEntries[]` — invalidate so
        // the new entry appears when the user returns to the detail screen.
        queryClient.invalidateQueries({ queryKey: ['quotes', quoteId] });
      }
      router.back();
    }
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
        createMutation={createMutation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  }
});
