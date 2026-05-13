import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Eyebrow } from '@/components/Eyebrow';
import { resolveFont, useTheme } from '@/theme';

import { CaptureFooter } from './_components';
import { useCaptureDraft } from './_state';

const HORIZONTAL_GUTTER = 28;

export default function CaptureConfirmScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { text, book, author, page } = useCaptureDraft();

  // Capture is only entered from home, so on Save we just navigate back to
  // home. `replace` (rather than push) so the capture flow isn't left in the
  // history stack. `router.dismiss` variants only affect the nested capture
  // stack, not the outer modal. Persistence will land with the data layer.
  const onSave = () => router.replace('/');

  return (
    <View style={styles.flex}>
      <View style={[styles.stepHeader, { paddingBottom: 24 }]}>
        <Text
          style={{
            fontFamily: resolveFont({ family: 'serif', weight: '400' }),
            fontSize: theme.fontSize.serif2xl,
            lineHeight: theme.lineHeight.serif2xl,
            color: theme.colors.textPrimary,
            marginBottom: 8
          }}
        >
          Ready to save
        </Text>
        <Eyebrow size={theme.fontSize.eyebrowSm}>
          You can add tags and notes later.
        </Eyebrow>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
      >
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.backgroundRaised,
              borderColor: theme.colors.hairline
            }
          ]}
        >
          <Text
            style={{
              fontFamily: resolveFont({ family: 'serif', weight: '400' }),
              fontSize: theme.fontSize.serifXl,
              lineHeight: theme.lineHeight.serifXl,
              color: theme.colors.textPrimary,
              marginBottom: 24
            }}
          >
            {`“${text.trim() || '—'}”`}
          </Text>
          <View
            style={[styles.divider, { backgroundColor: theme.colors.hairline }]}
          />
          <View style={styles.rows}>
            <ConfirmRow label='Book' value={book || '—'} />
            <ConfirmRow label='Author' value={author || '—'} />
            <ConfirmRow label='Page' value={page || '—'} />
          </View>
        </View>
      </ScrollView>

      <CaptureFooter primary='Save' onPrimary={onSave} />
    </View>
  );
}

interface ConfirmRowProps {
  label: string;
  value: string;
}

function ConfirmRow({ label, value }: ConfirmRowProps) {
  const theme = useTheme();
  return (
    <View style={styles.row}>
      <Eyebrow size={theme.fontSize.eyebrowSm}>{label}</Eyebrow>
      <Text
        style={{
          fontFamily: resolveFont({ family: 'sans', weight: '400' }),
          fontSize: theme.fontSize.bodyMd,
          color: theme.colors.textPrimary
        }}
      >
        {value}
      </Text>
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
    paddingBottom: 24
  },
  card: {
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderWidth: StyleSheet.hairlineWidth
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 18
  },
  rows: {
    gap: 10
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline'
  }
});
