import type { JournalEntry as JournalEntryRow, Quote } from "@ponder/db/schema";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { Eyebrow } from "@/components/Eyebrow";
import { NavHeader } from "@/components/NavHeader";
import { resolveFont, useTheme } from "@/theme";

// In API responses id/createdAt are always present; new.tsx passes a
// synthetic draft with id === 'new' to flip the composer mode on.
type JournalEntryData = JournalEntryRow & {
  id: string;
  createdAt?: Date | string;
};

interface JournalEntryProps {
  entry: JournalEntryData | null;
  /** Quote this entry links to — fetched separately by the parent. */
  linkedQuote: Quote | null;
  onBack: () => void;
  /** Called with the trimmed body when the user taps Save. New mode only. */
  onSave?: (body: string) => void;
}

const ENTRY_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

const HORIZONTAL_GUTTER = 28;

// -0.005em on 17pt body — matches the prototype's tracking on the journal body.
const BODY_TRACKING = -0.085;

/**
 * JournalEntry — read-only view of an existing entry, or an editable composer
 * when `entry.id === 'new'`. The "new" marker is the prototype's pattern: a
 * synthesized entry with id='new' carries the linking quoteId, an empty body,
 * and a "New entry" date label.
 *
 * In new mode, the NavHeader's right slot renders a Save action; tapping it
 * sends the trimmed body to the parent route, which is responsible for
 * persisting and popping the nested stack.
 */
export function JournalEntry({
  entry,
  linkedQuote,
  onBack,
  onSave,
}: JournalEntryProps) {
  const theme = useTheme();
  const isNew = entry?.id === "new";
  const [body, setBody] = useState(entry?.content ?? "");

  if (!entry) return null;

  const dateLabel = isNew
    ? "New entry"
    : entry.createdAt
      ? formatDate(entry.createdAt)
      : "";

  const canSave = body.trim().length > 0;

  const saveAction =
    isNew && onSave ? (
      <Pressable
        onPress={() => onSave(body.trim())}
        disabled={!canSave}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Save entry"
        accessibilityState={{ disabled: !canSave }}
      >
        <Eyebrow
          color={canSave ? theme.colors.textPrimary : theme.colors.textFaint}
        >
          Save
        </Eyebrow>
      </Pressable>
    ) : undefined;

  return (
    <View style={styles.root}>
      <NavHeader onBack={onBack} label="Quote" right={saveAction} />

      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
      >
        {linkedQuote && (
          <View
            style={[
              styles.contextBlock,
              { borderLeftColor: theme.colors.hairlineStrong },
            ]}
          >
            <Text
              numberOfLines={3}
              style={{
                fontFamily: resolveFont({
                  family: "serif",
                  weight: "400",
                  italic: true,
                }),
                fontSize: theme.fontSize.bodyMd,
                lineHeight: theme.lineHeight.bodyLg,
                color: theme.colors.textMuted,
                marginBottom: 8,
              }}
            >
              {`“${linkedQuote.text}”`}
            </Text>
            <Eyebrow
              size={theme.fontSize.eyebrowXs}
              color={theme.colors.textFaint}
            >
              {`${linkedQuote.authorName} · ${linkedQuote.bookTitle}`}
            </Eyebrow>
          </View>
        )}

        <Eyebrow style={styles.dateLabel}>{dateLabel}</Eyebrow>

        {isNew ? (
          <TextInput
            value={body}
            onChangeText={setBody}
            autoFocus
            multiline
            placeholder="Begin writing…"
            placeholderTextColor={theme.colors.textFaint}
            textAlignVertical="top"
            style={[
              styles.bodyInput,
              {
                fontFamily: resolveFont({ family: "serif", weight: "400" }),
                fontSize: theme.fontSize.serifLg,
                lineHeight: theme.lineHeight.serifLg,
                letterSpacing: BODY_TRACKING,
                color: theme.colors.textPrimary,
              },
            ]}
          />
        ) : (
          <Text
            style={{
              fontFamily: resolveFont({ family: "serif", weight: "400" }),
              fontSize: theme.fontSize.serifLg,
              lineHeight: theme.lineHeight.serifLg,
              letterSpacing: BODY_TRACKING,
              color: theme.colors.textPrimary,
            }}
          >
            {entry.content}
          </Text>
        )}
      </KeyboardAwareScrollView>
    </View>
  );
}

function formatDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString(undefined, ENTRY_DATE_FORMAT);
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_GUTTER,
    paddingTop: 24,
    paddingBottom: 60,
  },
  contextBlock: {
    marginBottom: 32,
    paddingLeft: 14,
    borderLeftWidth: 1,
  },
  dateLabel: {
    marginBottom: 20,
  },
  bodyInput: {
    minHeight: 280,
    padding: 0,
  },
});
