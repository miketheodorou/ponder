import type { CreateQuoteInput } from '@ponder/db/validators';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useWatch } from 'react-hook-form';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { createQuote } from '@/api/quotes';
import { Eyebrow } from '@/components/Eyebrow';
import { resolveFont, useTheme } from '@/theme';

import { CaptureFooter } from './_components';
import { useCaptureDraft } from './_state';

const HORIZONTAL_GUTTER = 28;

export default function CaptureConfirmScreen() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { form } = useCaptureDraft();
  const { control, handleSubmit } = form;
  const [text, bookTitle, authorName, pageNumber] = useWatch({
    control,
    name: ['text', 'bookTitle', 'authorName', 'pageNumber']
  });

  const createMutation = useMutation({
    mutationFn: (input: CreateQuoteInput) => createQuote(input),
    onSuccess: () => {
      // Prefix-matched: catalogue list, today's quote, any cached detail.
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      // `replace('/')` closes the entire capture modal in one step;
      // `router.dismiss()` would only pop the nested capture stack.
      router.replace('/');
    }
  });

  const onSave = handleSubmit((values) => createMutation.mutateAsync(values));

  const pageDisplay =
    pageNumber == null || Number.isNaN(pageNumber) ? '—' : String(pageNumber);

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
          You can add tags later.
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
            {`“${(text ?? '').trim() || '—'}”`}
          </Text>
          <View
            style={[styles.divider, { backgroundColor: theme.colors.hairline }]}
          />
          <View style={styles.rows}>
            <ConfirmRow label='Book' value={bookTitle?.trim() || '—'} />
            <ConfirmRow label='Author' value={authorName?.trim() || '—'} />
            <ConfirmRow label='Page' value={pageDisplay} />
          </View>
        </View>

        {createMutation.error ? (
          <Text
            style={{
              fontFamily: resolveFont({ family: 'sans', weight: '400' }),
              fontSize: theme.fontSize.bodySm,
              lineHeight: 18,
              color: theme.colors.destructive,
              textAlign: 'center',
              marginTop: 16
            }}
          >
            Couldn&apos;t save. Try again.
          </Text>
        ) : null}
      </ScrollView>

      <CaptureFooter
        primary='Save'
        onPrimary={onSave}
        pending={createMutation.isPending}
        disabled={createMutation.isPending}
      />
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
