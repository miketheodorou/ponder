import { forwardRef } from "react";
import {
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from "react-native";

import { resolveFont, useTheme } from "@/theme";

import { Eyebrow } from "./Eyebrow";

interface FieldProps extends Omit<TextInputProps, "style" | "placeholderTextColor"> {
  label: string;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Field — label (Eyebrow) above a TextInput with a single hairline rule
 * underneath. No box, no fill. Used by the auth flow and the capture context
 * step.
 *
 * Italic placeholder is faked by swapping the TextInput's fontFamily to the
 * italic variant while the value is empty — RN cannot style placeholder text
 * independently of the input text.
 */
export const Field = forwardRef<TextInput, FieldProps>(function Field(
  { label, value, containerStyle, ...rest },
  ref,
) {
  const theme = useTheme();
  const isEmpty = !value;

  return (
    <View style={containerStyle}>
      <Eyebrow size={theme.fontSize.eyebrowSm} style={styles.label}>
        {label}
      </Eyebrow>
      <TextInput
        ref={ref}
        value={value}
        placeholderTextColor={theme.colors.textFaint}
        selectionColor={theme.colors.textPrimary}
        keyboardAppearance={theme.scheme === "dark" ? "dark" : "light"}
        style={[
          styles.input,
          {
            fontFamily: resolveFont({
              family: "sans",
              weight: "300",
              italic: isEmpty,
            }),
            fontSize: theme.fontSize.body2xl,
            color: isEmpty ? theme.colors.textFaint : theme.colors.textPrimary,
            borderBottomWidth: theme.borderWidth.hairline,
            borderBottomColor: theme.colors.hairlineStrong,
          },
        ]}
        {...rest}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  label: {
    marginBottom: 10,
  },
  input: {
    width: "100%",
    paddingTop: 8,
    paddingBottom: 14,
    // 0.005em on 17px ≈ 0.085 — too small to merit a token.
    letterSpacing: 0.085,
  },
});
