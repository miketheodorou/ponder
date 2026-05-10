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
import { QuoteDetail } from "@/components/QuoteDetail";
import { QUOTES } from "@/data/quotes";
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

type NavEntry = { kind: "detail"; quoteId: string };

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
  // 0 = root pane (list); 1 = pushed pane (detail).
  const stackDepth = useSharedValue(0);

  const [navStack, setNavStack] = useState<NavEntry[]>([]);
  const top = navStack[navStack.length - 1] ?? null;

  // Keep the most recent detail entry rendered through the pop animation —
  // otherwise the pane unmounts immediately and the user sees a blank slot
  // sliding right.
  const [lastDetail, setLastDetail] = useState<NavEntry | null>(null);

  useEffect(() => {
    if (top?.kind === "detail") {
      setLastDetail(top);
    }
  }, [top]);

  useEffect(() => {
    stackDepth.value = withTiming(top ? 1 : 0, NAV_TIMING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [top]);

  const pushDetail = useCallback((quoteId: string) => {
    setNavStack((stack) => [...stack, { kind: "detail", quoteId }]);
  }, []);

  const popNav = useCallback(() => {
    setNavStack((stack) => stack.slice(0, -1));
  }, []);

  // Open/close. After a close completes, drop any pushed detail so the next
  // open lands on the list. Doing it on the animation callback avoids the
  // brief "flash to list" that resetting immediately would cause.
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
      { translateX: -windowWidth * PUSH_PARALLAX * stackDepth.value },
    ],
    opacity: 1 - PUSH_DIM * stackDepth.value,
  }));

  const detailPaneStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: windowWidth * (1 - stackDepth.value) },
    ],
  }));

  // Drag-to-dismiss is restricted to the handle area only — the list inside
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

  const detailEntry = top?.kind === "detail" ? top : lastDetail;
  const detailQuote = detailEntry
    ? QUOTES.find((q) => q.id === detailEntry.quoteId) ?? null
    : null;

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
            pointerEvents={top ? "none" : "auto"}
            style={[StyleSheet.absoluteFill, listPaneStyle]}
          >
            <CatalogueList onSelectQuote={pushDetail} />
          </Animated.View>

          <Animated.View
            pointerEvents={top ? "auto" : "none"}
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: theme.colors.backgroundRaised },
              detailPaneStyle,
            ]}
          >
            <QuoteDetail quote={detailQuote} onBack={popNav} />
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
