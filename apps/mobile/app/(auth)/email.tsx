import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Eyebrow, Field, PrimaryButton } from '@/components';
import { resolveFont, useTheme } from '@/theme';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function EmailScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const trimmed = email.trim();
  const valid = EMAIL_RE.test(trimmed);

  const onSendCode = () => {
    if (!valid) return;
    router.push({ pathname: '/code', params: { email: trimmed } });
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
          onChangeText={setEmail}
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

        <View style={styles.cta}>
          <PrimaryButton
            label='Send code'
            disabled={!valid}
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
