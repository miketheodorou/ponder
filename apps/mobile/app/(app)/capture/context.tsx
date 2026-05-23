import { useRouter } from 'expo-router';
import { Controller, useWatch } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';
import {
  KeyboardAwareScrollView,
  KeyboardToolbar
} from 'react-native-keyboard-controller';

import { Eyebrow } from '@/components/Eyebrow';
import { resolveFont, useTheme } from '@/theme';

import { CaptureField, CaptureFooter } from './_components';
import { useCaptureDraft } from './_state';

const HORIZONTAL_GUTTER = 28;
const KAS_BOTTOM_OFFSET = 90;

export default function CaptureContextScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { form } = useCaptureDraft();
  const { control } = form;
  const [bookTitle, authorName] = useWatch({
    control,
    name: ['bookTitle', 'authorName']
  });

  const nextDisabled = !bookTitle?.trim() || !authorName?.trim();

  return (
    <View style={styles.flex}>
      <View style={[styles.stepHeader, { paddingBottom: 28 }]}>
        <Text
          style={{
            fontFamily: resolveFont({ family: 'serif', weight: '400' }),
            fontSize: theme.fontSize.serif2xl,
            lineHeight: theme.lineHeight.serif2xl,
            color: theme.colors.textPrimary,
            marginBottom: 8
          }}
        >
          Where is it from?
        </Text>
        <Eyebrow size={theme.fontSize.eyebrowSm}>
          Add a book and author so you can find it later.
        </Eyebrow>
      </View>

      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='handled'
        bottomOffset={KAS_BOTTOM_OFFSET}
      >
        <Controller
          control={control}
          name='bookTitle'
          render={({ field: { value, onChange } }) => (
            <CaptureField
              label='Book'
              value={value ?? ''}
              onChange={onChange}
              placeholder='—'
              autoFocus
            />
          )}
        />
        <Controller
          control={control}
          name='authorName'
          render={({ field: { value, onChange } }) => (
            <CaptureField
              label='Author'
              value={value ?? ''}
              onChange={onChange}
              placeholder='—'
            />
          )}
        />
        <Controller
          control={control}
          name='pageNumber'
          render={({ field: { value, onChange } }) => (
            <CaptureField
              label='Page'
              value={value == null ? '' : String(value)}
              onChange={(s) => {
                const trimmed = s.trim();
                if (trimmed === '') return onChange(null);
                const n = Number(trimmed);
                onChange(Number.isFinite(n) ? n : NaN);
              }}
              placeholder='—'
              numeric
            />
          )}
        />
      </KeyboardAwareScrollView>

      <CaptureFooter
        primary='Next'
        onPrimary={() => router.push('/capture/confirm')}
        disabled={nextDisabled}
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
    paddingBottom: 16
  }
});
