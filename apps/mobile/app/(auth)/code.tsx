import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CodeInput, Eyebrow, PrimaryButton } from "@/components";
import { resolveFont, useTheme } from "@/theme";

export default function CodeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { email } = useLocalSearchParams<{ email?: string }>();
  const displayEmail = email ?? "your inbox";

  const [code, setCode] = useState("");
  const valid = code.length === 6;

  const onVerify = () => {
    if (!valid) return;
    // TODO: hand off to /home (or similar) once that route exists.
  };

  const onResend = () => {
    // TODO: trigger resend endpoint when the API is wired up.
  };

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
        },
      ]}
    >
      {/* Top: back + brand. */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.back}
        >
          <ChevronLeft color={theme.colors.textMuted} />
          <Eyebrow>Back</Eyebrow>
        </Pressable>
        <Eyebrow>Ponder</Eyebrow>
      </View>

      <View style={styles.form}>
        <Text
          style={{
            fontFamily: resolveFont({ family: "serif", weight: "400" }),
            fontSize: theme.fontSize.serif4xl,
            lineHeight: theme.lineHeight.serif4xl,
            letterSpacing: theme.letterSpacing.tightSerif,
            color: theme.colors.textPrimary,
            marginBottom: 14,
          }}
        >
          Check your email
        </Text>

        <Text
          style={{
            fontFamily: resolveFont({ family: "sans", weight: "300" }),
            fontSize: theme.fontSize.bodyLg,
            lineHeight: theme.lineHeight.bodyLg,
            color: theme.colors.textMuted,
            marginBottom: 44,
            maxWidth: 300,
          }}
        >
          We sent a six-digit code to{" "}
          <Text style={{ color: theme.colors.textPrimary }}>{displayEmail}</Text>
          . Enter it below to continue.
        </Text>

        <CodeInput
          value={code}
          onChangeText={setCode}
          onComplete={onVerify}
          autoFocus
        />

        <View style={styles.resend}>
          <Pressable onPress={onResend} hitSlop={12}>
            <Eyebrow>Resend code</Eyebrow>
          </Pressable>
        </View>

        <View style={styles.cta}>
          <PrimaryButton label="Verify" disabled={!valid} onPress={onVerify} />
        </View>
      </View>
    </View>
  );
}

// A tiny chevron drawn from a rotated border square — keeps the screen free
// of an SVG dependency for one icon. Replace with a real icon system once
// other screens need glyphs.
function ChevronLeft({ color }: { color: string }) {
  return (
    <View style={chevron.frame}>
      <View style={[chevron.glyph, { borderColor: color }]} />
    </View>
  );
}

const chevron = StyleSheet.create({
  frame: {
    width: 12,
    height: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  glyph: {
    width: 8,
    height: 8,
    borderTopWidth: 1.2,
    borderLeftWidth: 1.2,
    transform: [{ rotate: "-45deg" }],
    // Nudge to align the visual center of the rotated "L" with the frame.
    marginLeft: 2,
  },
});

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 22,
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginLeft: -6,
    paddingVertical: 6,
  },
  form: {
    paddingHorizontal: 32,
    paddingTop: 56,
  },
  resend: {
    marginTop: 22,
    alignItems: "center",
  },
  cta: {
    marginTop: 28,
  },
});
