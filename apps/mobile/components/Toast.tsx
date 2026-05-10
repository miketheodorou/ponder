import { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { Eyebrow } from "@/components/Eyebrow";
import { useTheme } from "@/theme";

interface ToastProps {
  /** Message to display, or `null` to hide. Pass `null` to dismiss. */
  message: string | null;
}

const TOAST_TIMING = {
  duration: 280,
  easing: Easing.bezier(0.32, 0.72, 0, 1),
};

/**
 * Animated pill that rises from below the bottom inset and fades in when
 * `message` is non-null. Lifecycle (when to clear) is the parent's
 * responsibility — Toast itself just animates between visible/hidden states.
 */
export function Toast({ message }: ToastProps) {
  const theme = useTheme();
  const visible = useSharedValue(0);

  useEffect(() => {
    visible.value = withTiming(message ? 1 : 0, TOAST_TIMING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: visible.value,
    transform: [{ translateY: 20 * (1 - visible.value) }],
  }));

  return (
    <View pointerEvents="none" style={styles.wrap}>
      <Animated.View
        style={[
          styles.pill,
          {
            backgroundColor: theme.colors.backgroundRaised2,
            borderColor: theme.colors.hairlineStrong,
          },
          animatedStyle,
        ]}
      >
        <Eyebrow color={theme.colors.textPrimary}>{message ?? ""}</Eyebrow>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 64,
    alignItems: "center",
  },
  pill: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 100,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
