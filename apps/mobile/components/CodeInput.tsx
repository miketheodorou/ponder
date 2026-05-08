import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

import { resolveFont, useTheme } from "@/theme";

interface CodeInputProps {
  value: string;
  onChangeText: (next: string) => void;
  /** Fired when the user has entered `length` digits — useful for auto-submit. */
  onComplete?: (code: string) => void;
  /** Number of digits. Defaults to 6. */
  length?: number;
  autoFocus?: boolean;
}

const SLOT_HEIGHT = 56;
const SLOT_GAP = 10;
const CARET_BLINK_MS = 530;

/**
 * CodeInput — N visual slots backed by a single transparent TextInput.
 *
 * The TextInput sits absolutely over the slot grid (opacity 0); native taps
 * focus it, the OS keyboard handles input, and the visible slot row is
 * driven from `value`. Non-digits are filtered inside the component, so the
 * consumer always sees a clean numeric string.
 *
 * iOS auto-fill: `textContentType="oneTimeCode"` lets the OS suggest a code
 * received by SMS in the QuickType bar. Android equivalent is
 * `autoComplete="sms-otp"`.
 */
export function CodeInput({
  value,
  onChangeText,
  onComplete,
  length = 6,
  autoFocus = false,
}: CodeInputProps) {
  const theme = useTheme();
  const inputRef = useRef<TextInput>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [caretOn, setCaretOn] = useState(true);

  // Restart the blink whenever focus or value changes — keeps the caret ON
  // immediately after a keystroke instead of mid-blink.
  useEffect(() => {
    if (!isFocused) return;
    setCaretOn(true);
    const id = setInterval(() => setCaretOn((c) => !c), CARET_BLINK_MS);
    return () => clearInterval(id);
  }, [isFocused, value]);

  const handleChange = (next: string) => {
    const digits = next.replace(/\D/g, "").slice(0, length);
    onChangeText(digits);
    if (digits.length === length) onComplete?.(digits);
  };

  return (
    <View style={styles.wrap}>
      <View style={styles.grid} pointerEvents="none">
        {Array.from({ length }).map((_, i) => {
          const ch = value[i] ?? "";
          const filled = i < value.length;
          const active = isFocused && i === value.length;

          return (
            <View
              key={i}
              style={[
                styles.slot,
                {
                  backgroundColor: filled
                    ? theme.colors.backgroundRaised2
                    : "transparent",
                  borderColor: active
                    ? theme.colors.textPrimary
                    : filled
                      ? theme.colors.hairlineStrong
                      : theme.colors.hairline,
                  borderRadius: theme.radius.lg,
                  borderWidth: theme.borderWidth.hairline,
                },
              ]}
            >
              {ch ? (
                <Text
                  style={{
                    fontFamily: resolveFont({ family: "serif", weight: "400" }),
                    fontSize: theme.fontSize.serif3xl,
                    color: theme.colors.textPrimary,
                    // 0.02em on 24px ≈ 0.48 — too small to merit a token.
                    letterSpacing: 0.48,
                  }}
                >
                  {ch}
                </Text>
              ) : active ? (
                <View
                  style={[
                    styles.caret,
                    {
                      backgroundColor: theme.colors.textPrimary,
                      opacity: caretOn ? 1 : 0,
                    },
                  ]}
                />
              ) : null}
            </View>
          );
        })}
      </View>

      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        autoFocus={autoFocus}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        maxLength={length}
        caretHidden
        selectionColor="transparent"
        keyboardAppearance={theme.scheme === "dark" ? "dark" : "light"}
        style={[StyleSheet.absoluteFillObject, styles.hiddenInput]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "relative",
  },
  grid: {
    flexDirection: "row",
    gap: SLOT_GAP,
  },
  slot: {
    flex: 1,
    height: SLOT_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  caret: {
    width: 1.5,
    height: 22,
  },
  hiddenInput: {
    opacity: 0,
    color: "transparent",
  },
});
