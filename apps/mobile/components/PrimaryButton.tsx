import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { resolveFont, useTheme } from "@/theme";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** While true, swap the label for an ActivityIndicator and ignore presses. */
  pending?: boolean;
  /** "solid" — cream-on-dark fill (default). "outline" — transparent w/ hairline. */
  variant?: "solid" | "outline";
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  pending = false,
  variant = "solid",
}: PrimaryButtonProps) {
  const theme = useTheme();
  const isOutline = variant === "outline";

  const fillBg = isOutline ? "transparent" : theme.colors.textPrimary;
  const fillFg = isOutline ? theme.colors.textPrimary : theme.colors.background;

  const disabledBg = isOutline ? "transparent" : theme.colors.backgroundRaised2;
  const disabledFg = theme.colors.textFaint;

  const blocked = disabled || pending;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: blocked, busy: pending }}
      onPress={blocked ? undefined : onPress}
      disabled={blocked}
      style={({ pressed }) => [
        styles.pressable,
        {
          opacity: pressed && !blocked ? 0.88 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.pill,
          {
            backgroundColor: disabled && !pending ? disabledBg : fillBg,
            borderRadius: theme.radius.pill,
            borderWidth: isOutline ? theme.borderWidth.hairline : 0,
            borderColor: isOutline ? theme.colors.hairlineStrong : "transparent",
          },
        ]}
      >
        {pending ? (
          <ActivityIndicator color={fillFg} size="small" />
        ) : (
          <Text
            style={{
              fontFamily: resolveFont({ family: "sans", weight: "500" }),
              fontSize: theme.fontSize.bodySm,
              color: disabled ? disabledFg : fillFg,
              letterSpacing: theme.letterSpacing.uppercaseMd,
              textTransform: "uppercase",
            }}
          >
            {label}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    width: "100%",
  },
  pill: {
    width: "100%",
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
});
