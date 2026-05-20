import { useQuery } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { getQuoteById } from '@/api/quotes';
import { QuoteDetail } from '@/components';
import { useTheme } from '@/theme';

export default function QuoteDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: quote } = useQuery({
    queryKey: ['quotes', id],
    queryFn: () => getQuoteById(id),
    enabled: Boolean(id)
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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  }
});
