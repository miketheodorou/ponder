import type { UpdateQuoteInput } from '@ponder/db/validators';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { deleteQuote, getQuoteById, updateQuote } from '@/api/quotes';
import { QuoteDetail } from '@/components';
import { useTheme } from '@/theme';

export default function QuoteDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data: quote } = useQuery({
    queryKey: ['quotes', id],
    queryFn: () => getQuoteById(id),
    enabled: Boolean(id)
  });

  const saveMutation = useMutation({
    mutationFn: (input: UpdateQuoteInput) => updateQuote(id, input),
    onSuccess: () => {
      // Prefix-matched: catalogue list, today's quote, and this detail.
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteQuote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.removeQueries({ queryKey: ['journal-entries'] });
      router.back();
    }
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
      <QuoteDetail
        quote={quote ?? null}
        onBack={() => router.back()}
        onOpenEntry={(entryId) => router.push(`/catalogue/entry/${entryId}`)}
        onNewEntry={() => router.push(`/catalogue/entry/new?quoteId=${id}`)}
        saveMutation={saveMutation}
        deleteMutation={deleteMutation}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  }
});
