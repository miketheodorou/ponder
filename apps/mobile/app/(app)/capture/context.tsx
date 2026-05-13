import { useRouter } from 'expo-router';
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
  const { book, setBook, author, setAuthor, page, setPage } = useCaptureDraft();

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
          Pre-filled from your last capture.
        </Eyebrow>
      </View>

      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps='handled'
        bottomOffset={KAS_BOTTOM_OFFSET}
      >
        <CaptureField label='Book' value={book} onChange={setBook} />
        <CaptureField label='Author' value={author} onChange={setAuthor} />
        <CaptureField
          label='Page'
          value={page}
          onChange={setPage}
          placeholder='—'
          numeric
        />
      </KeyboardAwareScrollView>

      <CaptureFooter
        primary='Next'
        onPrimary={() => router.push('/capture/confirm')}
        disabled={!book.trim() || !author.trim()}
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
