import { useSignIn, useSignUp } from "@clerk/expo";
import type { SetActiveNavigate } from "@clerk/expo/types";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CodeInput, Eyebrow, PrimaryButton } from "@/components";
import { resolveFont, useTheme } from "@/theme";

type Mode = "signin" | "signup";

const VERIFY_ERROR = "Couldn't verify that code. Please try again.";

// `finalize({ navigate })` runs after the session activates. Its job here is
// only to surface Clerk session tasks (MFA setup, org picker, forced password
// reset) — the (auth) → (app) swap itself is driven by <Stack.Protected> in
// app/_layout.tsx, so we deliberately do NOT call router.replace('/') in the
// no-task branch (doing so races the guard flip and produces
// "REPLACE not handled" errors).
//
// When a task-producing feature gets turned on in the Clerk dashboard, add a
// route for it (e.g. app/task/[key].tsx, protected by `isSignedIn &&
// session?.currentTask`) and route to it here instead of throwing.
const finalizeNavigate: SetActiveNavigate = ({ session }) => {
  const task = session?.currentTask;
  if (task) {
    throw new Error(
      `Unhandled Clerk session task: ${task.key}. Add a screen for this task and route to it from finalizeNavigate.`,
    );
  }
};

export default function CodeScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { email, mode: modeParam } = useLocalSearchParams<{
    email?: string;
    mode?: string;
  }>();
  const displayEmail = email ?? "your inbox";
  const mode: Mode = modeParam === "signup" ? "signup" : "signin";

  const { signIn } = useSignIn();
  const { signUp } = useSignUp();

  const [code, setCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const valid = code.length === 6;

  const verify = async (digits: string) => {
    if (digits.length !== 6 || submitting) return;
    setSubmitting(true);
    setError(null);

    if (mode === "signin") {
      const { error: verifyErr } = await signIn.emailCode.verifyCode({
        code: digits,
      });
      if (verifyErr) {
        setError(verifyErr.message || VERIFY_ERROR);
        setSubmitting(false);
        return;
      }
      if (signIn.status !== "complete") {
        setError(VERIFY_ERROR);
        setSubmitting(false);
        return;
      }
      const { error: finalizeErr } = await signIn.finalize({
        navigate: finalizeNavigate,
      });
      if (finalizeErr) {
        setError(finalizeErr.message || VERIFY_ERROR);
        setSubmitting(false);
      }
      return;
    }

    const { error: verifyErr } = await signUp.verifications.verifyEmailCode({
      code: digits,
    });
    if (verifyErr) {
      setError(verifyErr.message || VERIFY_ERROR);
      setSubmitting(false);
      return;
    }
    if (signUp.status !== "complete") {
      setError(VERIFY_ERROR);
      setSubmitting(false);
      return;
    }
    const { error: finalizeErr } = await signUp.finalize({
      navigate: finalizeNavigate,
    });
    if (finalizeErr) {
      setError(finalizeErr.message || VERIFY_ERROR);
      setSubmitting(false);
    }
  };

  const onVerify = () => {
    if (!valid) return;
    void verify(code);
  };

  const onComplete = (digits: string) => {
    void verify(digits);
  };

  const onResend = async () => {
    setError(null);
    const { error: resendErr } =
      mode === "signin"
        ? await signIn.emailCode.sendCode()
        : await signUp.verifications.sendEmailCode();
    if (resendErr) {
      setError(resendErr.message || "Couldn't resend the code.");
    }
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
          {mode === "signup" ? " to create your account" : ""}. Enter it below
          to continue.
        </Text>

        <CodeInput
          value={code}
          onChangeText={(next) => {
            setCode(next);
            if (error) setError(null);
          }}
          onComplete={onComplete}
          autoFocus
        />

        {error ? (
          <Text
            style={{
              marginTop: 14,
              fontFamily: resolveFont({ family: "sans", weight: "400" }),
              fontSize: theme.fontSize.bodySm,
              lineHeight: theme.lineHeight.bodySm,
              color: theme.colors.textPrimary,
              textAlign: "center",
            }}
          >
            {error}
          </Text>
        ) : null}

        <View style={styles.resend}>
          <Pressable onPress={onResend} hitSlop={12}>
            <Eyebrow>Resend code</Eyebrow>
          </Pressable>
        </View>

        <View style={styles.cta}>
          <PrimaryButton
            label={submitting ? "Verifying…" : "Verify"}
            disabled={!valid || submitting}
            onPress={onVerify}
          />
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
