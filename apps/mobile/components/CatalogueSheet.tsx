import { useEffect } from "react";
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
import { useTheme } from "@/theme";

// The sheet covers 92% of the viewport — same proportion as the prototype.
const SHEET_HEIGHT_RATIO = 0.92;
// Drag past this many points (or release with this much downward velocity) to dismiss.
const DISMISS_TRANSLATION = 120;
const DISMISS_VELOCITY = 800;

const OPEN_TIMING = {
  duration: 380,
  easing: Easing.bezier(0.32, 0.72, 0, 1),
};
const SETTLE_TIMING = {
  duration: 280,
  easing: Easing.bezier(0.32, 0.72, 0, 1),
};

interface CatalogueSheetProps {
  open: boolean;
  onClose: () => void;
}

export function CatalogueSheet({ open, onClose }: CatalogueSheetProps) {
  const theme = useTheme();
  const { height: windowHeight } = useWindowDimensions();
  const sheetHeight = windowHeight * SHEET_HEIGHT_RATIO;

  // 0 = fully open at rest, sheetHeight = fully closed (off-screen below).
  const translateY = useSharedValue(sheetHeight);

  useEffect(() => {
    translateY.value = withTiming(open ? 0 : sheetHeight, OPEN_TIMING);
    // translateY is a stable shared value; intentionally omitted from deps.
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
          <CatalogueList />
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
  },
});
