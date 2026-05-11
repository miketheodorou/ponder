import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { QuoteDetail } from '@/components';
import { QUOTES } from '@/data/quotes';
import { useTheme } from '@/theme';

export default function QuoteDetailScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();

  const quote = QUOTES.find((q) => q.id === id) ?? null;

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
        quote={quote}
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
