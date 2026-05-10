import { useCallback, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  Directions,
  Gesture,
  GestureDetector,
} from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  CatalogueSheet,
  ChevronUp,
  Eyebrow,
  PlusIcon,
} from "@/components";
import { QUOTES } from "@/data/quotes";
import { resolveFont, useTheme } from "@/theme";

// Quote rendered as the day's hero. Hardcoded to the most recent for now —
// will become "today's pick" once there's real selection logic.
const HERO_QUOTE_ID = "q1";

export default function HomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const quote = QUOTES.find((q) => q.id === HERO_QUOTE_ID) ?? QUOTES[0];

  const [catalogueOpen, setCatalogueOpen] = useState(false);

  const openCatalogue = useCallback(() => setCatalogueOpen(true), []);
  const closeCatalogue = useCallback(() => setCatalogueOpen(false), []);

  const onAdd = () => {
    // TODO: open the capture modal.
  };

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
            paddingBottom: Math.max(insets.bottom, theme.spacing.giant),
          },
        ]}
      >
        <View style={styles.header}>
          <Eyebrow>Ponder</Eyebrow>
          <Pressable
            onPress={onAdd}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Capture a quote"
            style={styles.headerAction}
          >
            <PlusIcon size={theme.icon.lg} color={theme.colors.textPrimary} />
          </Pressable>
        </View>

        <View style={styles.quoteWrap}>
          <Text
            style={{
              fontFamily: resolveFont({ family: "serif", weight: "400" }),
              fontSize: theme.fontSize.serif4xl,
              lineHeight: theme.lineHeight.serif4xl,
              letterSpacing: theme.letterSpacing.tightSerif,
              color: theme.colors.textPrimary,
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
              { backgroundColor: theme.colors.hairlineStrong },
            ]}
          />
          <Pressable
            onPress={openCatalogue}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Open catalogue"
            style={styles.catalogueAction}
          >
            <ChevronUp size={theme.icon.sm} color={theme.colors.textMuted} />
            <Eyebrow>Swipe for Catalogue</Eyebrow>
          </Pressable>
        </View>

        <CatalogueSheet open={catalogueOpen} onClose={closeCatalogue} />
      </View>
    </GestureDetector>
  );
}

const HORIZONTAL_GUTTER = 28;
// Shifts the hero quote slightly above true center, matching the prototype.
const QUOTE_OPTICAL_LIFT = -32;

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 20,
    paddingHorizontal: HORIZONTAL_GUTTER,
  },
  headerAction: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    marginRight: -8,
  },
  quoteWrap: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
    marginTop: QUOTE_OPTICAL_LIFT,
  },
  footer: {
    // Hairline spans the full screen width, so the footer itself has no
    // horizontal padding — child rows pad themselves.
  },
  attribution: {
    paddingHorizontal: HORIZONTAL_GUTTER,
    marginBottom: 22,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 18,
  },
  catalogueAction: {
    alignItems: "center",
    gap: 8,
    paddingVertical: 4,
    paddingHorizontal: HORIZONTAL_GUTTER,
  },
});
