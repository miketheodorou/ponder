import { Pressable, StyleSheet, Text, View } from "react-native";

import { resolveFont, useTheme } from "@/theme";

interface PrimaryButtonProps {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** "solid" — cream-on-dark fill (default). "outline" — transparent w/ hairline. */
  variant?: "solid" | "outline";
}

/**
 * PrimaryButton — full-width pill CTA used for "Sign in", "Save", "Next".
 * The pressed state dims the entire pill rather than swapping colors so the
 * shape stays still under the finger.
 */
export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  variant = "solid",
}: PrimaryButtonProps) {
  const theme = useTheme();
  const isOutline = variant === "outline";

  const fillBg = isOutline ? "transparent" : theme.colors.textPrimary;
  const fillFg = isOutline ? theme.colors.textPrimary : theme.colors.background;

  const disabledBg = isOutline ? "transparent" : theme.colors.backgroundRaised2;
  const disabledFg = theme.colors.textFaint;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.pressable,
        {
          opacity: pressed && !disabled ? 0.88 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.pill,
          {
            backgroundColor: disabled ? disabledBg : fillBg,
            borderRadius: theme.radius.pill,
            borderWidth: isOutline ? theme.borderWidth.hairline : 0,
            borderColor: isOutline ? theme.colors.hairlineStrong : "transparent",
          },
        ]}
      >
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
