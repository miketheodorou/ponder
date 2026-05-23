import { StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Eyebrow } from '@/components/Eyebrow';
import { PrimaryButton } from '@/components/PrimaryButton';
import { resolveFont, useTheme } from '@/theme';

const HORIZONTAL_GUTTER = 28;

// Shared bottom-of-screen action row used by the edit, context, and confirm
// steps. Provides the hairline divider above the PrimaryButton and the bottom
// safe-area inset.
interface CaptureFooterProps {
  primary: string;
  onPrimary: () => void;
  disabled?: boolean;
  pending?: boolean;
}

export function CaptureFooter({
  primary,
  onPrimary,
  disabled,
  pending
}: CaptureFooterProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.footer,
        {
          borderTopColor: theme.colors.hairline,
          paddingBottom: Math.max(insets.bottom, theme.spacing.giant) - 24
        }
      ]}
    >
      <PrimaryButton
        label={primary}
        onPress={onPrimary}
        disabled={disabled}
        pending={pending}
      />
    </View>
  );
}

// Label-on-left, input-on-right row used by the context step (Book / Author /
// Page). Hairline bottom border between rows.
interface CaptureFieldProps {
  label: string;
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
  numeric?: boolean;
}

export function CaptureField({
  label,
  value,
  onChange,
  placeholder,
  numeric
}: CaptureFieldProps) {
  const theme = useTheme();
  return (
    <View
      style={[styles.field, { borderBottomColor: theme.colors.hairline }]}
    >
      <View style={styles.fieldLabel}>
        <Eyebrow size={theme.fontSize.eyebrowSm}>{label}</Eyebrow>
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textFaint}
        keyboardType={numeric ? 'number-pad' : 'default'}
        autoCorrect={!numeric}
        style={{
          flex: 1,
          padding: 0,
          fontFamily: resolveFont({ family: 'sans', weight: '300' }),
          fontSize: theme.fontSize.bodyXl,
          color: theme.colors.textPrimary
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    paddingHorizontal: HORIZONTAL_GUTTER,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth
  },
  field: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 16,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  fieldLabel: {
    width: 64
  }
});
