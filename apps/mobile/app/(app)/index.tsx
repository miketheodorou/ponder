import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getTodaysQuote } from '@/api/quotes';
import { ChevronUp, Eyebrow, PlusIcon } from '@/components';
import { resolveFont, useTheme } from '@/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: quote } = useQuery({
    queryKey: ['quotes', 'today'],
    queryFn: getTodaysQuote
  });

  const openCatalogue = useCallback(() => {
    router.push('/catalogue');
  }, [router]);
  const openCapture = useCallback(() => {
    router.push('/capture');
  }, [router]);
  const openSettings = useCallback(() => {
    router.push('/settings');
  }, [router]);

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom
        }
      ]}
    >
      <View style={styles.header}>
        <Pressable
          onPress={openSettings}
          hitSlop={12}
          accessibilityRole='button'
          accessibilityLabel='Open settings'
          style={styles.eyebrowAction}
        >
          <Eyebrow>Ponder</Eyebrow>
        </Pressable>
        <Pressable
          onPress={openCapture}
          hitSlop={12}
          accessibilityRole='button'
          accessibilityLabel='Capture a quote'
          style={styles.headerAction}
        >
          <PlusIcon size={theme.icon.lg} color={theme.colors.textPrimary} />
        </Pressable>
      </View>

      <View style={styles.quoteWrap}>
        {quote && (
          <Text
            style={{
              fontFamily: resolveFont({ family: 'serif', weight: '400' }),
              fontSize: theme.fontSize.serif4xl,
              lineHeight: theme.lineHeight.serif4xl,
              letterSpacing: theme.letterSpacing.tightSerif,
              color: theme.colors.textPrimary
            }}
          >
            {`“${quote.text}”`}
          </Text>
        )}
      </View>

      <View style={styles.footer}>
        <View style={styles.attribution}>
          {quote && (
            <Eyebrow>{`${quote.authorName} · ${quote.bookTitle}`}</Eyebrow>
          )}
        </View>
        <View
          style={[
            styles.divider,
            { backgroundColor: theme.colors.hairlineStrong }
          ]}
        />
        <Pressable
          onPress={openCatalogue}
          hitSlop={12}
          accessibilityRole='button'
          accessibilityLabel='Open catalogue'
          style={styles.catalogueAction}
        >
          <ChevronUp size={theme.icon.sm} color={theme.colors.textMuted} />
          <Eyebrow>Catalogue</Eyebrow>
        </Pressable>
      </View>
    </View>
  );
}

const HORIZONTAL_GUTTER = 28;
// Shifts the hero quote slightly above true center, matching the prototype.
const QUOTE_OPTICAL_LIFT = -32;

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 20,
    paddingHorizontal: HORIZONTAL_GUTTER
  },
  eyebrowAction: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginLeft: -6
  },
  headerAction: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -8
  },
  quoteWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    marginTop: QUOTE_OPTICAL_LIFT
  },
  footer: {
    // Hairline spans the full screen width, so the footer itself has no
    // horizontal padding — child rows pad themselves.
  },
  attribution: {
    paddingHorizontal: HORIZONTAL_GUTTER,
    marginBottom: 22
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 18
  },
  catalogueAction: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: HORIZONTAL_GUTTER
  }
});
