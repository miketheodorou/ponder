import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { resolveFont, useTheme } from "@/theme";

interface ConfirmDialogProps {
  visible: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const SHEET_DURATION = 320;
const SHEET_EASING = Easing.bezier(0.32, 0.72, 0, 1);
// Floor for the home indicator clearance when the device has no bottom inset.
const HOME_INDICATOR_CLEARANCE = 24;

/**
 * iOS-style destructive action sheet. Renders nothing until `visible` flips
 * true, then mounts behind a `Modal` and animates a scrim fade + sheet rise.
 * On dismiss we play the exit animation first, then unmount.
 */
export function ConfirmDialog({
  visible,
  title = "Remove this entry?",
  message = "This can't be undone. The linked quote stays in your catalogue.",
  confirmLabel = "Remove",
  cancelLabel = "Cancel",
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [rendered, setRendered] = useState(visible);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      progress.value = withTiming(1, {
        duration: SHEET_DURATION,
        easing: SHEET_EASING,
      });
    } else if (rendered) {
      progress.value = withTiming(
        0,
        { duration: SHEET_DURATION, easing: SHEET_EASING },
        (finished) => {
          if (finished) runOnJS(setRendered)(false);
        },
      );
    }
    // progress is a stable shared value; rendered is intentionally not a dep —
    // it would re-fire the exit on every state change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * 320 }],
  }));

  if (!rendered) return null;

  const bottomPad = Math.max(insets.bottom, HOME_INDICATOR_CLEARANCE);

  return (
    <Modal
      visible
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.root}>
        <AnimatedPressable
          onPress={onCancel}
          style={[
            styles.scrim,
            { backgroundColor: theme.colors.scrimStrong },
            scrimStyle,
          ]}
        />
        <Animated.View
          style={[styles.sheetWrap, { paddingBottom: bottomPad }, sheetStyle]}
          pointerEvents="box-none"
        >
          <View
            style={[
              styles.card,
              styles.actionCard,
              {
                backgroundColor: theme.colors.backgroundRaised2,
                borderColor: theme.colors.hairline,
                borderRadius: theme.radius.xl,
              },
            ]}
          >
            <View
              style={[
                styles.header,
                { borderBottomColor: theme.colors.hairline },
              ]}
            >
              <Text
                style={{
                  fontFamily: resolveFont({ family: "sans", weight: "500" }),
                  fontSize: theme.fontSize.bodyLg,
                  color: theme.colors.textPrimary,
                  letterSpacing: 0.07,
                  textAlign: "center",
                  marginBottom: 6,
                }}
              >
                {title}
              </Text>
              <Text
                style={{
                  fontFamily: resolveFont({ family: "sans", weight: "300" }),
                  fontSize: theme.fontSize.bodySm,
                  lineHeight: 18,
                  color: theme.colors.textMuted,
                  textAlign: "center",
                  maxWidth: 280,
                  alignSelf: "center",
                }}
              >
                {message}
              </Text>
            </View>
            <Pressable
              onPress={onConfirm}
              accessibilityRole="button"
              style={({ pressed }) => [
                styles.actionButton,
                { opacity: pressed ? 0.6 : 1 },
              ]}
            >
              <Text
                style={{
                  fontFamily: resolveFont({ family: "sans", weight: "500" }),
                  fontSize: 16,
                  color: theme.colors.destructive,
                  letterSpacing: -0.08,
                }}
              >
                {confirmLabel}
              </Text>
            </Pressable>
          </View>

          <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            style={({ pressed }) => [
              styles.card,
              styles.cancelButton,
              {
                backgroundColor: theme.colors.backgroundRaised2,
                borderColor: theme.colors.hairline,
                borderRadius: theme.radius.xl,
                opacity: pressed ? 0.6 : 1,
              },
            ]}
          >
            <Text
              style={{
                fontFamily: resolveFont({ family: "sans", weight: "600" }),
                fontSize: 16,
                color: theme.colors.textPrimary,
                letterSpacing: -0.08,
              }}
            >
              {cancelLabel}
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "flex-end",
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetWrap: {
    paddingHorizontal: 10,
  },
  card: {
    width: "100%",
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  actionCard: {
    marginBottom: 8,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 22,
    paddingBottom: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  actionButton: {
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButton: {
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
  },
});
