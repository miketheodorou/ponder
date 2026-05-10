import { useCallback, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Directions,
  Gesture,
  GestureDetector
} from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CaptureModal,
  type CaptureSavedQuote,
  CatalogueSheet,
  ChevronUp,
  Eyebrow,
  PlusIcon,
  Toast
} from '@/components';
import {
  type JournalEntry as JournalEntryData,
  type Quote,
  QUOTES
} from '@/data/quotes';
import { resolveFont, useTheme } from '@/theme';

// Quote rendered as the day's hero. Hardcoded to the most recent for now —
// will become "today's pick" once there's real selection logic.
const HERO_QUOTE_ID = 'q1';

// Date format matches the seeded mock data ("March 14, 2026") so session
// items render identically to the seeded ones.
function formatToday(): string {
  return new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}

const TOAST_DURATION_MS = 2200;

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const quote = QUOTES.find((q) => q.id === HERO_QUOTE_ID) ?? QUOTES[0];

  const [catalogueOpen, setCatalogueOpen] = useState(false);
  const [captureOpen, setCaptureOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Session-only stores. HomeScreen owns both because (a) the home screen is
  // mounted for the lifetime of the app session and (b) both stores need to
  // be readable by CatalogueSheet, while sessionQuotes is also written to by
  // CaptureModal mounted here. Cleared only on app reload.
  const [sessionQuotes, setSessionQuotes] = useState<Quote[]>([]);
  const [sessionEntries, setSessionEntries] = useState<JournalEntryData[]>([]);

  // Toast timer is held in a ref so consecutive saves restart the dismiss
  // window cleanly instead of stacking timers.
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = useCallback((message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), TOAST_DURATION_MS);
  }, []);

  const openCatalogue = useCallback(() => setCatalogueOpen(true), []);
  const closeCatalogue = useCallback(() => setCatalogueOpen(false), []);
  const openCapture = useCallback(() => setCaptureOpen(true), []);
  const closeCapture = useCallback(() => setCaptureOpen(false), []);

  const addQuote = useCallback((input: CaptureSavedQuote) => {
    const pageNum = parseInt(input.page, 10);
    const newQuote: Quote = {
      id: `sq_${Date.now()}`,
      text: input.text,
      author: input.author.trim(),
      book: input.book.trim(),
      page: Number.isFinite(pageNum) ? pageNum : 0,
      date: formatToday(),
      tags: [],
      notes: '',
      entries: []
    };
    setSessionQuotes((prev) => [newQuote, ...prev]);
  }, []);

  const addEntry = useCallback(
    ({ quoteId, body }: { quoteId: string; body: string }) => {
      const entry: JournalEntryData = {
        id: `se_${Date.now()}`,
        quoteId,
        date: formatToday(),
        body
      };
      setSessionEntries((prev) => [entry, ...prev]);
    },
    []
  );

  const onCaptureSave = useCallback(
    (input: CaptureSavedQuote) => {
      addQuote(input);
      closeCapture();
      showToast('Saved to catalogue');
    },
    [addQuote, closeCapture, showToast]
  );

  // Swipe up anywhere on the home surface opens the catalogue. Tap on the
  // catalogue control at the bottom does the same — both paths feed the
  // same state so they can't get out of sync.
  const swipeUp = Gesture.Fling()
    .direction(Directions.UP)
    .onStart(() => {
      openCatalogue();
    })
    .runOnJS(true);

  return (
    <GestureDetector gesture={swipeUp}>
      <View
        style={[
          styles.root,
          {
            backgroundColor: theme.colors.background,
            paddingTop: insets.top,
            paddingBottom: Math.max(insets.bottom, theme.spacing.giant)
          }
        ]}
      >
        <View style={styles.header}>
          <Eyebrow>Ponder</Eyebrow>
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
        </View>

        <View style={styles.footer}>
          <View style={styles.attribution}>
            <Eyebrow>{`${quote.author} · ${quote.book}`}</Eyebrow>
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
            <Eyebrow>Swipe for Catalogue</Eyebrow>
          </Pressable>
        </View>

        <CatalogueSheet
          open={catalogueOpen}
          onClose={closeCatalogue}
          sessionQuotes={sessionQuotes}
          sessionEntries={sessionEntries}
          onAddEntry={addEntry}
        />
        <CaptureModal
          open={captureOpen}
          onClose={closeCapture}
          onSave={onCaptureSave}
        />
        <Toast message={toast} />
      </View>
    </GestureDetector>
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
