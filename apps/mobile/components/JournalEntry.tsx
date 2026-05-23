import { zodResolver } from "@hookform/resolvers/zod";
import type {
  JournalEntry as JournalEntryRow,
  Quote,
} from "@ponder/db/schema";
import {
  createJournalEntrySchema,
  type CreateJournalEntryInput,
  type UpdateJournalEntryInput,
} from "@ponder/db/validators";
import type { UseMutationResult } from "@tanstack/react-query";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

import { ConfirmDialog } from "@/components/ConfirmDialog";
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
  /** Composer-mode submit (entry.id === 'new'). */
  createMutation?: UseMutationResult<
    JournalEntryRow,
    Error,
    CreateJournalEntryInput
  >;
  /** Edit-existing save. */
  editMutation?: UseMutationResult<
    JournalEntryRow,
    Error,
    UpdateJournalEntryInput
  >;
  deleteMutation?: UseMutationResult<JournalEntryRow, Error, void>;
}

// Form value shape is the same for create and update — `content: string`.
// We always use `createJournalEntrySchema` for the resolver because the UI
// requires non-empty content in both modes (the update schema only loosens
// `content` to optional for partial wire payloads, which doesn't apply here).
type ContentForm = CreateJournalEntryInput;

const ENTRY_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};

const HORIZONTAL_GUTTER = 28;
const BODY_TRACKING = -0.085;

export function JournalEntry({
  entry,
  linkedQuote,
  onBack,
  createMutation,
  editMutation,
  deleteMutation,
}: JournalEntryProps) {
  const theme = useTheme();
  const isNew = entry?.id === "new";
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Single form drives both composer and edit modes.
  const form = useForm<ContentForm>({
    resolver: zodResolver(createJournalEntrySchema),
    mode: "onChange",
    defaultValues: { content: entry?.content ?? "" },
  });
  const {
    control,
    handleSubmit,
    formState: { isValid },
    reset,
  } = form;

  if (!entry) return null;

  const dateLabel = isNew
    ? "New entry"
    : entry.createdAt
      ? formatDate(entry.createdAt)
      : "";

  const activeMutation = isNew ? createMutation : editMutation;
  const submitPending = activeMutation?.isPending ?? false;
  const submitErrored =
    !!activeMutation?.error && (isNew || editing);

  const startEdit = () => {
    reset({ content: entry.content ?? "" });
    editMutation?.reset();
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const onSubmit = handleSubmit(async (values) => {
    if (isNew) {
      if (!createMutation) return;
      try {
        await createMutation.mutateAsync({ content: values.content.trim() });
      } catch {
        // createMutation.error holds it; banner reads it directly.
      }
    } else {
      if (!editMutation) return;
      try {
        await editMutation.mutateAsync({ content: values.content.trim() });
        setEditing(false);
      } catch {
        // editMutation.error holds it; banner reads it directly.
      }
    }
  });

  const rightAction = isNew ? (
    <Pressable
      onPress={onSubmit}
      disabled={!isValid || submitPending}
      hitSlop={12}
      accessibilityRole="button"
      accessibilityLabel="Save entry"
      accessibilityState={{ disabled: !isValid || submitPending }}
      style={styles.headerAction}
    >
      {submitPending ? (
        <ActivityIndicator color={theme.colors.destructive} size="small" />
      ) : (
        <Eyebrow
          color={isValid ? theme.colors.textPrimary : theme.colors.textFaint}
        >
          Save
        </Eyebrow>
      )}
    </Pressable>
  ) : editing ? (
    <Pressable
      onPress={onSubmit}
      accessibilityRole="button"
      accessibilityLabel="Save changes"
      accessibilityState={{ disabled: !isValid || submitPending }}
      disabled={!isValid || submitPending}
      hitSlop={12}
      style={styles.headerAction}
    >
      {submitPending ? (
        <ActivityIndicator color={theme.colors.destructive} size="small" />
      ) : (
        <Eyebrow
          color={isValid ? theme.colors.textPrimary : theme.colors.textFaint}
        >
          Done
        </Eyebrow>
      )}
    </Pressable>
  ) : (
    <Pressable
      onPress={startEdit}
      accessibilityRole="button"
      accessibilityLabel="Edit entry"
      hitSlop={12}
      style={styles.headerAction}
    >
      <Eyebrow color={theme.colors.textMuted}>Edit</Eyebrow>
    </Pressable>
  );

  const leftAction = editing && !isNew ? (
    <Pressable
      onPress={cancelEdit}
      accessibilityRole="button"
      accessibilityLabel="Cancel edit"
      accessibilityState={{ disabled: submitPending }}
      disabled={submitPending}
      hitSlop={12}
      style={[styles.headerAction, { opacity: submitPending ? 0.5 : 1 }]}
    >
      <Eyebrow color={theme.colors.textMuted}>Cancel</Eyebrow>
    </Pressable>
  ) : undefined;

  return (
    <View style={styles.root}>
      <NavHeader
        onBack={onBack}
        label="Quote"
        left={leftAction}
        right={rightAction}
      />

      <KeyboardAwareScrollView
        style={styles.scroll}
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

        {submitErrored ? (
          <Text
            style={{
              fontFamily: resolveFont({ family: "sans", weight: "400" }),
              fontSize: theme.fontSize.bodySm,
              lineHeight: 18,
              color: theme.colors.destructive,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Couldn&apos;t save. Try again.
          </Text>
        ) : null}

        {isNew || editing ? (
          <Controller
            control={control}
            name="content"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value ?? ""}
                onChangeText={onChange}
                onBlur={onBlur}
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
            )}
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

      {!isNew && !editing && (
        <View
          style={[
            styles.removeBar,
            {
              backgroundColor: theme.colors.backgroundRaised,
              borderTopColor: theme.colors.hairline,
            },
          ]}
        >
          <Pressable
            onPress={() => setConfirmDelete(true)}
            accessibilityRole="button"
            accessibilityLabel="Remove entry"
            hitSlop={8}
            style={styles.removeButton}
          >
            <Eyebrow
              size={theme.fontSize.eyebrowSm}
              color={theme.colors.textFaint}
            >
              Remove entry
            </Eyebrow>
          </Pressable>
        </View>
      )}

      <ConfirmDialog
        visible={confirmDelete}
        title="Remove this entry?"
        message="This can't be undone. The linked quote stays in your catalogue."
        confirmLabel="Remove"
        pending={deleteMutation?.isPending ?? false}
        errorMessage={
          deleteMutation?.error ? "Couldn't remove. Try again." : null
        }
        onCancel={() => {
          deleteMutation?.reset();
          setConfirmDelete(false);
        }}
        onConfirm={() => deleteMutation?.mutate()}
      />
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
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_GUTTER,
    paddingTop: 24,
    paddingBottom: 60,
  },
  headerAction: {
    paddingVertical: 6,
    paddingHorizontal: 6,
    marginHorizontal: -6,
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
  removeBar: {
    flexShrink: 0,
    paddingTop: 14,
    paddingBottom: 32,
    paddingHorizontal: HORIZONTAL_GUTTER,
    borderTopWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  removeButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
});
