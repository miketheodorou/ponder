import { useRouter } from 'expo-router';
import { Controller, useWatch } from 'react-hook-form';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardToolbar
} from 'react-native-keyboard-controller';

import { Eyebrow } from '@/components/Eyebrow';
import { resolveFont, useTheme } from '@/theme';

import { CaptureFooter } from './_components';
import { useCaptureDraft } from './_state';

const HORIZONTAL_GUTTER = 28;
// -0.005em on 17pt body — matches the prototype's tracking on the OCR editor.
const BODY_TRACKING = -0.085;
// Reserved space below the focused input so it stays clear of the CaptureFooter
// (PrimaryButton + safe area). Rough sum of footer paddingTop + button + gutter.
const KAS_BOTTOM_OFFSET = 90;

export default function CaptureEditScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { form, photoTaken } = useCaptureDraft();
  const { control } = form;
  const text = useWatch({ control, name: 'text' }) ?? '';

  // On the photo path the user has picked lines in the `select` step, so this
  // input arrives pre-filled and they're trimming it down. On the Skip path
  // they're typing from scratch — swap the copy to match the path taken.
  const title = photoTaken ? 'Trim to the quote' : 'Enter the quote';
  const subtitle = photoTaken
    ? 'Edit until only the passage you want to keep remains.'
    : 'Type the passage you want to save.';

  return (
    <View style={styles.flex}>
      <View style={styles.stepHeader}>
        <Text
          style={{
            fontFamily: resolveFont({ family: 'serif', weight: '400' }),
            fontSize: theme.fontSize.serif2xl,
            lineHeight: theme.lineHeight.serif2xl,
            color: theme.colors.textPrimary,
            marginBottom: 8
          }}
        >
          {title}
        </Text>
        <Eyebrow size={theme.fontSize.eyebrowSm}>{subtitle}</Eyebrow>
      </View>

      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='handled'
        bottomOffset={KAS_BOTTOM_OFFSET}
      >
        <Controller
          control={control}
          name='text'
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              value={value ?? ''}
              onChangeText={onChange}
              onBlur={onBlur}
              autoFocus
              multiline
              textAlignVertical='top'
              placeholder='—'
              placeholderTextColor={theme.colors.textFaint}
              style={{
                minHeight: 320,
                padding: 0,
                fontFamily: resolveFont({ family: 'serif', weight: '400' }),
                fontSize: theme.fontSize.serifLg,
                lineHeight: theme.lineHeight.serifLg,
                letterSpacing: BODY_TRACKING,
                color: theme.colors.textPrimary
              }}
            />
          )}
        />
      </KeyboardAwareScrollView>

      <CaptureFooter
        primary='Next'
        onPrimary={() => router.push('/capture/context')}
        disabled={!text.trim()}
      />

      <KeyboardToolbar />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  stepHeader: {
    paddingHorizontal: HORIZONTAL_GUTTER,
    paddingTop: 32,
    paddingBottom: 16
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_GUTTER,
    paddingTop: 8,
    paddingBottom: 16
  }
});
