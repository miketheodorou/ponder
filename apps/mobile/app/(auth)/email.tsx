import { useSignIn, useSignUp } from '@clerk/expo';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Eyebrow, Field, PrimaryButton } from '@/components';
import { resolveFont, useTheme } from '@/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const GENERIC_ERROR = 'Something went wrong. Please try again.';

export default function EmailScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trimmed = email.trim();
  const valid = EMAIL_RE.test(trimmed);

  const onSendCode = async () => {
    if (!valid || submitting) return;

    setSubmitting(true);
    setError(null);

    // Bootstrap a sign-in. `signUpIfMissing: true` makes the resource
    // `isTransferable` when no user matches the identifier — letting us
    // flip into a sign-up without parsing error codes.
    const { error: createError } = await signIn.create({
      identifier: trimmed,
      signUpIfMissing: true
    });

    // Check transferability BEFORE surfacing createError. With
    // `signUpIfMissing: true`, Clerk still returns an error like
    // "Couldn't find your account" when the email is unknown — but it
    // ALSO marks the resource transferable. Bailing on the error first
    // would skip the transfer and dead-end legitimate new users.
    if (signIn.isTransferable) {
      const { error: transferError } = await signUp.create({ transfer: true });
      const { error: sendError } = transferError
        ? { error: transferError }
        : await signUp.verifications.sendEmailCode();

      if (transferError || sendError) {
        setError((transferError ?? sendError)?.message || GENERIC_ERROR);
        setSubmitting(false);
        return;
      }

      router.push({
        pathname: '/code',
        params: { email: trimmed, mode: 'signup' }
      });
      setSubmitting(false);
      return;
    }

    if (createError) {
      setError(createError.message || GENERIC_ERROR);
      setSubmitting(false);
      return;
    }

    const { error: sendError } = await signIn.emailCode.sendCode({
      emailAddress: trimmed
    });
    if (sendError) {
      setError(sendError.message || GENERIC_ERROR);
      setSubmitting(false);
      return;
    }

    router.push({
      pathname: '/code',
      params: { email: trimmed, mode: 'signin' }
    });
    setSubmitting(false);
  };

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: theme.colors.background,
          paddingTop: insets.top
        }
      ]}
    >
      {/* Brand eyebrow — sits where the Welcome screen's blank row sits. */}
      <View style={styles.eyebrowRow}>
        <Eyebrow>Ponder</Eyebrow>
      </View>

      {/* Form is anchored from the top so the keyboard slide-up doesn't
          shove the layout around. The form sits high enough that on common
          devices it stays fully above the keyboard. */}
      <View style={styles.form}>
        <Text
          style={{
            fontFamily: resolveFont({ family: 'serif', weight: '400' }),
            fontSize: theme.fontSize.serif4xl,
            lineHeight: theme.lineHeight.serif4xl,
            letterSpacing: theme.letterSpacing.tightSerif,
            color: theme.colors.textPrimary,
            marginBottom: 14
          }}
        >
          Sign in to Ponder
        </Text>

        <Text
          style={{
            fontFamily: resolveFont({ family: 'sans', weight: '300' }),
            fontSize: theme.fontSize.bodyLg,
            lineHeight: theme.lineHeight.bodyLg,
            color: theme.colors.textMuted,
            marginBottom: 44,
            maxWidth: 290
          }}
        >
          Enter your email and we&apos;ll send a six-digit code to sign you in.
        </Text>

        <Field
          label='Email'
          value={email}
          onChangeText={(next) => {
            setEmail(next);
            if (error) setError(null);
          }}
          placeholder='you@example.com'
          keyboardType='email-address'
          autoCapitalize='none'
          autoComplete='email'
          autoCorrect={false}
          textContentType='emailAddress'
          autoFocus
          returnKeyType='send'
          enablesReturnKeyAutomatically
          onSubmitEditing={onSendCode}
        />

        {error ? (
          <Text
            style={{
              marginTop: 14,
              fontFamily: resolveFont({ family: 'sans', weight: '400' }),
              fontSize: theme.fontSize.bodySm,
              lineHeight: theme.lineHeight.bodySm,
              color: theme.colors.textPrimary
            }}
          >
            {error}
          </Text>
        ) : null}

        <View style={styles.cta}>
          <PrimaryButton
            label={submitting ? 'Sending…' : 'Send code'}
            disabled={!valid || submitting}
            onPress={onSendCode}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  eyebrowRow: {
    paddingTop: 20,
    paddingHorizontal: 28,
    height: 32,
    justifyContent: 'flex-start'
  },
  form: {
    paddingHorizontal: 32,
    paddingTop: 56
  },
  cta: {
    marginTop: 36
  }
});
