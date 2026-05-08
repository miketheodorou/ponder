import type { ReactNode } from "react";
import { StyleSheet, Text, type StyleProp, type TextStyle } from "react-native";

import { resolveFont, useTheme } from "@/theme";

interface EyebrowProps {
  children: ReactNode;
  /** Foreground color override; defaults to the muted text color. */
  color?: string;
  /** Font size in DIPs. Defaults to 11 (FontSize.eyebrowMd). */
  size?: number;
  style?: StyleProp<TextStyle>;
}

/**
 * Eyebrow — small uppercase tracked sans-serif label.
 * Used for metadata, section headers, and chrome throughout the app.
 */
export function Eyebrow({ children, color, size, style }: EyebrowProps) {
  const theme = useTheme();
  const fontSize = size ?? theme.fontSize.eyebrowMd;

  return (
    <Text
      style={[
        styles.base,
        {
          fontFamily: resolveFont({ family: "sans", weight: "400" }),
          fontSize,
          color: color ?? theme.colors.textMuted,
          letterSpacing: theme.letterSpacing.uppercaseLg,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    textTransform: "uppercase",
  },
});
