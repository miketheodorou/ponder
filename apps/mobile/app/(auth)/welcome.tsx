import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Eyebrow, PrimaryButton } from "@/components";
import { resolveFont, useTheme } from "@/theme";

export default function WelcomeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const onSignIn = () => {
    router.push("/email");
  };

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, theme.spacing.xxl),
        },
      ]}
    >
      {/* Top eyebrow row — kept blank on Welcome for symmetry with the other auth screens. */}
      <View style={styles.eyebrowRow} />

      {/* Wordmark + tagline, slightly above true center. */}
      <View style={styles.center}>
        <Text
          style={{
            fontFamily: resolveFont({ family: "serif", weight: "400" }),
            fontSize: theme.fontSize.serifDisplay,
            lineHeight: theme.lineHeight.serifDisplay,
            letterSpacing: theme.letterSpacing.tightDisplay,
            color: theme.colors.textPrimary,
            marginBottom: 22,
          }}
        >
          Ponder
        </Text>

        <Text
          style={{
            fontFamily: resolveFont({ family: "sans", weight: "300", italic: true }),
            fontSize: theme.fontSize.bodyLg,
            lineHeight: theme.lineHeight.bodyLg,
            letterSpacing: theme.letterSpacing.bodyLoose,
            color: theme.colors.textMuted,
            textAlign: "center",
            maxWidth: 260,
          }}
        >
          A quiet home for the words you want to keep.
        </Text>
      </View>

      {/* Bottom CTA. */}
      <View style={styles.bottom}>
        <PrimaryButton label="Sign in with email" onPress={onSignIn} />
        <View style={styles.disclaimer}>
          <Eyebrow
            size={theme.fontSize.eyebrowSm}
            color={theme.colors.textFaint}
          >
            By continuing you agree to our terms
          </Eyebrow>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  eyebrowRow: {
    height: 32,
    paddingHorizontal: 28,
    paddingTop: 20,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    // Pull content slightly above true vertical center so it sits comfortably
    // with the bottom CTA — matches the prototype's `marginTop: -40`.
    marginTop: -40,
  },
  bottom: {
    paddingHorizontal: 32,
    paddingBottom: 32,
  },
  disclaimer: {
    marginTop: 18,
    alignItems: "center",
  },
});
