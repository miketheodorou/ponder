import { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { CatalogueList } from "@/components/CatalogueList";
import { JournalEntry } from "@/components/JournalEntry";
import { QuoteDetail } from "@/components/QuoteDetail";
import {
  ENTRIES,
  type JournalEntry as JournalEntryData,
  QUOTES,
} from "@/data/quotes";
import { useTheme } from "@/theme";

// The sheet covers 92% of the viewport — same proportion as the prototype.
const SHEET_HEIGHT_RATIO = 0.92;
// Drag past this many points (or release with this much downward velocity) to dismiss.
const DISMISS_TRANSLATION = 120;
const DISMISS_VELOCITY = 800;
// How far the underlying pane slides as the next pane is pushed on top.
const PUSH_PARALLAX = 0.3;
// How much the underlying pane dims under the new one.
const PUSH_DIM = 0.6;

const OPEN_TIMING = {
  duration: 380,
  easing: Easing.bezier(0.32, 0.72, 0, 1),
};
const SETTLE_TIMING = {
  duration: 280,
  easing: Easing.bezier(0.32, 0.72, 0, 1),
};
const NAV_TIMING = {
  duration: 320,
  easing: Easing.bezier(0.32, 0.72, 0, 1),
};

type NavEntry =
  | { kind: "detail"; quoteId: string }
  | { kind: "journal"; entryId: string; quoteId?: string };

// Date format matches the mock data ("March 14, 2026") so session entries
// render identically to seeded ones.
function formatToday(): string {
  return new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

interface CatalogueSheetProps {
  open: boolean;
  onClose: () => void;
}

export function CatalogueSheet({ open, onClose }: CatalogueSheetProps) {
  const theme = useTheme();
  const { height: windowHeight, width: windowWidth } = useWindowDimensions();
  const sheetHeight = windowHeight * SHEET_HEIGHT_RATIO;

  // 0 = fully open at rest, sheetHeight = fully closed (off-screen below).
  const translateY = useSharedValue(sheetHeight);
  // 0 → list (root), 1 → detail, 2 → journal. Continuously interpolated.
  const stackDepth = useSharedValue(0);

  const [navStack, setNavStack] = useState<NavEntry[]>([]);

  // Session-only journal entries created via "+ New entry" → Save. Stored at
  // the sheet level (not on the QuoteDetail screen) so the value survives
  // pop-to-detail and sheet close/reopen — only an app reload clears it.
  // Drops in here cleanly until we have a real data layer.
  const [sessionEntries, setSessionEntries] = useState<JournalEntryData[]>([]);

  // Find the entry in the stack at each level (or null if not pushed). Each
  // level's pane is also kept rendered through its pop animation via the
  // matching `last*` state — see the comment on lastDetail.
  const detailInStack =
    navStack.find((e): e is Extract<NavEntry, { kind: "detail" }> =>
      e.kind === "detail"
    ) ?? null;
  const journalInStack =
    navStack.find((e): e is Extract<NavEntry, { kind: "journal" }> =>
      e.kind === "journal"
    ) ?? null;

  // Keep the most recent entry rendered through the pop animation —
  // otherwise the pane unmounts the moment it leaves the stack and the user
  // sees a blank rectangle slide right.
  const [lastDetail, setLastDetail] = useState<
    Extract<NavEntry, { kind: "detail" }> | null
  >(null);
  const [lastJournal, setLastJournal] = useState<
    Extract<NavEntry, { kind: "journal" }> | null
  >(null);

  useEffect(() => {
    if (detailInStack) setLastDetail(detailInStack);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailInStack?.quoteId]);

  useEffect(() => {
    if (journalInStack) setLastJournal(journalInStack);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journalInStack?.entryId, journalInStack?.quoteId]);

  useEffect(() => {
    stackDepth.value = withTiming(navStack.length, NAV_TIMING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navStack.length]);

  const pushDetail = useCallback((quoteId: string) => {
    setNavStack((stack) => [...stack, { kind: "detail", quoteId }]);
  }, []);

  const popNav = useCallback(() => {
    setNavStack((stack) => stack.slice(0, -1));
  }, []);

  const openEntry = useCallback((entryId: string) => {
    setNavStack((stack) => [...stack, { kind: "journal", entryId }]);
  }, []);

  // The currently-pushed detail provides the linking quoteId for new entries.
  // Reading the latest stack state via the updater avoids capturing a stale
  // reference if the user double-taps "+ New entry" mid-render.
  const newEntry = useCallback(() => {
    setNavStack((stack) => {
      const currentDetail = stack.find((e) => e.kind === "detail");
      if (!currentDetail) return stack;
      return [
        ...stack,
        {
          kind: "journal",
          entryId: "new",
          quoteId: currentDetail.quoteId,
        },
      ];
    });
  }, []);

  const saveJournalEntry = useCallback(
    (body: string) => {
      const trimmed = body.trim();
      if (!trimmed) return;
      const journal = navStack.find((e) => e.kind === "journal");
      if (!journal || journal.entryId !== "new" || !journal.quoteId) return;

      setSessionEntries((prev) => [
        {
          id: `s_${Date.now()}`,
          quoteId: journal.quoteId!,
          date: formatToday(),
          body: trimmed,
        },
        ...prev,
      ]);
      setNavStack((stack) => stack.slice(0, -1));
    },
    [navStack]
  );

  // Open/close. After a close completes, drop any pushed nav entries so the
  // next open lands on the list. Doing it on the animation callback avoids
  // the brief "flash to list" that resetting immediately would cause.
  useEffect(() => {
    if (open) {
      translateY.value = withTiming(0, OPEN_TIMING);
    } else {
      translateY.value = withTiming(sheetHeight, OPEN_TIMING, (finished) => {
        if (finished) {
          runOnJS(setNavStack)([]);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sheetHeight]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [0, sheetHeight],
      [1, 0],
      "clamp"
    ),
  }));

  const listPaneStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          stackDepth.value,
          [0, 1],
          [0, -windowWidth * PUSH_PARALLAX],
          "clamp"
        ),
      },
    ],
    opacity: interpolate(stackDepth.value, [0, 1], [1, 1 - PUSH_DIM], "clamp"),
  }));

  const detailPaneStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          stackDepth.value,
          [0, 1, 2],
          [windowWidth, 0, -windowWidth * PUSH_PARALLAX],
          "clamp"
        ),
      },
    ],
    opacity: interpolate(stackDepth.value, [1, 2], [1, 1 - PUSH_DIM], "clamp"),
  }));

  const journalPaneStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          stackDepth.value,
          [1, 2],
          [windowWidth, 0],
          "clamp"
        ),
      },
    ],
  }));

  // Drag-to-dismiss is restricted to the handle area only — the panes inside
  // the sheet should be free to scroll without fighting the sheet gesture.
  const dragGesture = Gesture.Pan()
    .activeOffsetY(10)
    .onUpdate((e) => {
      "worklet";
      translateY.value = Math.max(0, e.translationY);
    })
    .onEnd((e) => {
      "worklet";
      const shouldClose =
        e.translationY > DISMISS_TRANSLATION ||
        e.velocityY > DISMISS_VELOCITY;
      if (shouldClose) {
        translateY.value = withTiming(sheetHeight, SETTLE_TIMING, () => {
          runOnJS(onClose)();
        });
      } else {
        translateY.value = withTiming(0, SETTLE_TIMING);
      }
    });

  const detailEntry = detailInStack ?? lastDetail;
  const detailQuote = detailEntry
    ? QUOTES.find((q) => q.id === detailEntry.quoteId) ?? null
    : null;

  const journalEntry = journalInStack ?? lastJournal;
  const resolvedJournalEntry: JournalEntryData | null = journalEntry
    ? journalEntry.entryId === "new"
      ? {
          id: "new",
          quoteId: journalEntry.quoteId ?? "",
          date: "New entry",
          body: "",
        }
      : ENTRIES[journalEntry.entryId] ??
        sessionEntries.find((e) => e.id === journalEntry.entryId) ??
        null
    : null;

  const detailSessionEntries = detailQuote
    ? sessionEntries.filter((e) => e.quoteId === detailQuote.id)
    : [];

  const depth = navStack.length;

  return (
    <View
      pointerEvents={open ? "auto" : "none"}
      style={StyleSheet.absoluteFill}
    >
      <Animated.View
        pointerEvents={open ? "auto" : "none"}
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: theme.colors.scrim },
          scrimStyle,
        ]}
      >
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel="Close catalogue"
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          {
            height: sheetHeight,
            backgroundColor: theme.colors.backgroundRaised,
          },
          sheetStyle,
        ]}
      >
        <GestureDetector gesture={dragGesture}>
          <View style={styles.handleArea}>
            <View
              style={[
                styles.handle,
                { backgroundColor: theme.colors.textFaint },
              ]}
            />
          </View>
        </GestureDetector>

        <View style={styles.body}>
          <Animated.View
            pointerEvents={depth === 0 ? "auto" : "none"}
            style={[StyleSheet.absoluteFill, listPaneStyle]}
          >
            <CatalogueList onSelectQuote={pushDetail} />
          </Animated.View>

          <Animated.View
            pointerEvents={depth === 1 ? "auto" : "none"}
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: theme.colors.backgroundRaised },
              detailPaneStyle,
            ]}
          >
            <QuoteDetail
              quote={detailQuote}
              onBack={popNav}
              onOpenEntry={openEntry}
              onNewEntry={newEntry}
              sessionEntries={detailSessionEntries}
            />
          </Animated.View>

          <Animated.View
            pointerEvents={depth === 2 ? "auto" : "none"}
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: theme.colors.backgroundRaised },
              journalPaneStyle,
            ]}
          >
            <JournalEntry
              entry={resolvedJournalEntry}
              onBack={popNav}
              onSave={saveJournalEntry}
            />
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  handleArea: {
    paddingTop: 10,
    paddingBottom: 6,
    alignItems: "center",
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
  },
  body: {
    flex: 1,
    overflow: "hidden",
  },
});
