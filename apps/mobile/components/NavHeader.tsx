import type { ReactNode } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { Eyebrow } from "@/components/Eyebrow";
import { ChevronLeft } from "@/components/icons";
import { useTheme } from "@/theme";

interface NavHeaderProps {
  onBack: () => void;
  /** Label rendered next to the back chevron — typically the parent screen's name. */
  label: string;
  /** Optional action rendered on the right. Used e.g. for a Save button. */
  right?: ReactNode;
  /** When provided, replaces the default chevron+label back affordance. */
  left?: ReactNode;
}

export function NavHeader({ onBack, label, right, left }: NavHeaderProps) {
  const theme = useTheme();
  return (
    <View style={styles.root}>
      {left ?? (
        <Pressable
          onPress={onBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={`Back to ${label}`}
          style={styles.back}
        >
          <ChevronLeft size={theme.icon.sm} color={theme.colors.textMuted} />
          <Eyebrow>{label}</Eyebrow>
        </Pressable>
      )}
      {right ? <View style={styles.right}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    paddingHorizontal: 22,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingRight: 6,
    marginLeft: -6,
  },
  right: {
    paddingVertical: 6,
    paddingLeft: 6,
    marginRight: -6,
  },
});
