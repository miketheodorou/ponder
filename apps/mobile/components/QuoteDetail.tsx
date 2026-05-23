import { zodResolver } from "@hookform/resolvers/zod";
import type { Quote } from "@ponder/db/schema";
import {
  updateQuoteSchema,
  type UpdateQuoteInput,
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
import { ChevronRight } from "@/components/icons";
import { NavHeader } from "@/components/NavHeader";
import { resolveFont, useTheme } from "@/theme";

type JournalEntryPreview = {
  id: string;
  preview: string;
  createdAt: string;
};

type QuoteDetailData = Quote & {
  id: string;
  createdAt: Date | string;
  themes: string[];
  journalEntries: JournalEntryPreview[];
};

interface QuoteDetailProps {
  quote: QuoteDetailData | null;
  onBack: () => void;
  onOpenEntry?: (entryId: string) => void;
  onNewEntry?: () => void;
  saveMutation?: UseMutationResult<Quote, Error, UpdateQuoteInput>;
  deleteMutation?: UseMutationResult<Quote, Error, void>;
}

const HORIZONTAL_GUTTER = 28;
const SAVED_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
  year: "numeric",
};
const ENTRY_DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
};

export function QuoteDetail({
  quote,
  onBack,
  onOpenEntry,
  onNewEntry,
  saveMutation,
  deleteMutation,
}: QuoteDetailProps) {
  const theme = useTheme();

  const [tags, setTags] = useState<string[]>(quote?.themes ?? []);
  const [editingTag, setEditingTag] = useState(false);
  const [tagDraft, setTagDraft] = useState("");
  const [editing, setEditing] = useState(false);
  const [confirmDeleteQuote, setConfirmDeleteQuote] = useState(false);

  const form = useForm<UpdateQuoteInput>({
    resolver: zodResolver(updateQuoteSchema),
    mode: "onChange",
    defaultValues: {
      text: quote?.text ?? "",
      authorName: quote?.authorName ?? "",
      bookTitle: quote?.bookTitle ?? "",
      pageNumber: quote?.pageNumber ?? null,
    },
  });
  const {
    control,
    handleSubmit,
    formState: { isValid },
    reset,
  } = form;

  if (!quote) return null;

  const linkedEntries = quote.journalEntries;
  const savePending = saveMutation?.isPending ?? false;
  const saveErrored = !!saveMutation?.error;

  const submitTag = () => {
    const trimmed = tagDraft.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagDraft("");
    setEditingTag(false);
  };

  const startEdit = () => {
    reset({
      text: quote.text,
      authorName: quote.authorName,
      bookTitle: quote.bookTitle,
      pageNumber: quote.pageNumber ?? null,
    });
    saveMutation?.reset();
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const onConfirmEdit = handleSubmit(async (values) => {
    if (!saveMutation) return;
    try {
      await saveMutation.mutateAsync(values);
      setEditing(false);
    } catch {
      // mutation.error holds it; the banner reads it directly.
    }
  });

  const rightAction = editing ? (
    <Pressable
      onPress={onConfirmEdit}
      accessibilityRole="button"
      accessibilityLabel="Save changes"
      accessibilityState={{ disabled: !isValid || savePending }}
      disabled={!isValid || savePending}
      hitSlop={12}
      style={styles.headerAction}
    >
      {savePending ? (
        <ActivityIndicator
          color={theme.colors.destructive}
          size="small"
        />
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
      accessibilityLabel="Edit quote"
      hitSlop={12}
      style={styles.headerAction}
    >
      <Eyebrow color={theme.colors.textMuted}>Edit</Eyebrow>
    </Pressable>
  );

  const leftAction = editing ? (
    <Pressable
      onPress={cancelEdit}
      accessibilityRole="button"
      accessibilityLabel="Cancel edit"
      accessibilityState={{ disabled: savePending }}
      disabled={savePending}
      hitSlop={12}
      style={[styles.headerAction, { opacity: savePending ? 0.5 : 1 }]}
    >
      <Eyebrow color={theme.colors.textMuted}>Cancel</Eyebrow>
    </Pressable>
  ) : undefined;

  return (
    <View style={styles.root}>
      <NavHeader
        onBack={onBack}
        label="Catalogue"
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
        {editing && saveErrored ? (
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

        {editing ? (
          <Controller
            control={control}
            name="text"
            render={({ field: { value, onChange, onBlur } }) => (
              <TextInput
                value={value ?? ""}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                autoFocus
                textAlignVertical="top"
                placeholder="Quote text"
                placeholderTextColor={theme.colors.textFaint}
                style={{
                  fontFamily: resolveFont({ family: "serif", weight: "400" }),
                  fontSize: theme.fontSize.serif3xl,
                  lineHeight: theme.lineHeight.serif3xl,
                  letterSpacing: theme.letterSpacing.tightSerif,
                  color: theme.colors.textPrimary,
                  marginBottom: 36,
                  padding: 0,
                  minHeight: 120,
                }}
              />
            )}
          />
        ) : (
          <Text
            style={{
              fontFamily: resolveFont({ family: "serif", weight: "400" }),
              fontSize: theme.fontSize.serif3xl,
              lineHeight: theme.lineHeight.serif3xl,
              letterSpacing: theme.letterSpacing.tightSerif,
              color: theme.colors.textPrimary,
              marginBottom: 36,
            }}
          >
            {`“${quote.text}”`}
          </Text>
        )}

        <View style={styles.metaGroup}>
          {editing ? (
            <>
              <Controller
                control={control}
                name="authorName"
                render={({ field: { value, onChange, onBlur } }) => (
                  <EditableMetaRow
                    label="Author"
                    value={value ?? ""}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
              <Controller
                control={control}
                name="bookTitle"
                render={({ field: { value, onChange, onBlur } }) => (
                  <EditableMetaRow
                    label="Book"
                    value={value ?? ""}
                    onChangeText={onChange}
                    onBlur={onBlur}
                  />
                )}
              />
              <Controller
                control={control}
                name="pageNumber"
                render={({ field: { value, onChange, onBlur } }) => (
                  <EditableMetaRow
                    label="Page"
                    value={value == null ? "" : String(value)}
                    onChangeText={(text) => {
                      const trimmed = text.trim();
                      if (trimmed === "") return onChange(null);
                      const n = Number(trimmed);
                      onChange(Number.isFinite(n) ? n : NaN);
                    }}
                    onBlur={onBlur}
                    keyboardType="number-pad"
                  />
                )}
              />
            </>
          ) : (
            <>
              <MetaRow label="Author" value={quote.authorName} />
              <MetaRow label="Book" value={quote.bookTitle} />
              <MetaRow
                label="Page"
                value={quote.pageNumber != null ? String(quote.pageNumber) : "—"}
              />
            </>
          )}
          <MetaRow
            label="Saved"
            value={formatDate(quote.createdAt, SAVED_DATE_FORMAT)}
          />
        </View>

        <View
          style={styles.section}
          pointerEvents={editing ? "none" : "auto"}
        >
          <Eyebrow size={theme.fontSize.eyebrowSm} style={styles.sectionLabel}>
            Tags
          </Eyebrow>
          <View style={[styles.tagWrap, editing && { opacity: 0.5 }]}>
            {tags.map((tag) => (
              <View
                key={tag}
                style={[
                  styles.tag,
                  {
                    backgroundColor: theme.colors.backgroundRaised2,
                    borderColor: theme.colors.hairline,
                  },
                ]}
              >
                <Text
                  style={{
                    fontFamily: resolveFont({ family: "sans", weight: "400" }),
                    fontSize: theme.fontSize.bodyXs,
                    color: theme.colors.textMuted,
                    letterSpacing: 0.22,
                  }}
                >
                  {tag}
                </Text>
              </View>
            ))}
            {editingTag ? (
              <View
                style={[
                  styles.tag,
                  styles.tagEditing,
                  {
                    borderColor: theme.colors.hairlineStrong,
                  },
                ]}
              >
                <TextInput
                  value={tagDraft}
                  onChangeText={setTagDraft}
                  onBlur={submitTag}
                  onSubmitEditing={submitTag}
                  autoFocus
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  placeholder="tag"
                  placeholderTextColor={theme.colors.textFaint}
                  style={{
                    fontFamily: resolveFont({ family: "sans", weight: "400" }),
                    fontSize: theme.fontSize.bodyXs,
                    color: theme.colors.textPrimary,
                    letterSpacing: 0.22,
                    minWidth: 40,
                    padding: 0,
                  }}
                />
              </View>
            ) : (
              <Pressable
                onPress={() => setEditingTag(true)}
                accessibilityRole="button"
                accessibilityLabel="Add tag"
                style={[
                  styles.addTag,
                  { borderColor: theme.colors.hairline },
                ]}
              >
                <Text
                  style={{
                    fontFamily: resolveFont({ family: "sans", weight: "400" }),
                    fontSize: theme.fontSize.bodyXs,
                    color: theme.colors.textFaint,
                    letterSpacing: 0.22,
                  }}
                >
                  + tag
                </Text>
              </Pressable>
            )}
          </View>
        </View>

        <View pointerEvents={editing ? "none" : "auto"} style={editing && { opacity: 0.5 }}>
          <Eyebrow size={theme.fontSize.eyebrowSm} style={styles.sectionLabel}>
            {`Journal · ${linkedEntries.length} ${
              linkedEntries.length === 1 ? "entry" : "entries"
            }`}
          </Eyebrow>

          {linkedEntries.length > 0 ? (
            linkedEntries.map((entry) => (
              <Pressable
                key={entry.id}
                onPress={() => onOpenEntry?.(entry.id)}
                accessibilityRole="button"
                style={[
                  styles.entryRow,
                  { borderTopColor: theme.colors.hairline },
                ]}
              >
                <View style={styles.entryRowText}>
                  <Text
                    numberOfLines={1}
                    style={{
                      fontFamily: resolveFont({
                        family: "serif",
                        weight: "400",
                        italic: true,
                      }),
                      fontSize: theme.fontSize.bodyLg,
                      lineHeight: theme.lineHeight.bodyLg,
                      color: theme.colors.textPrimary,
                      marginBottom: 6,
                    }}
                  >
                    {entry.preview}
                  </Text>
                  <Eyebrow size={theme.fontSize.eyebrowSm}>
                    {formatDate(entry.createdAt, ENTRY_DATE_FORMAT)}
                  </Eyebrow>
                </View>
                <ChevronRight
                  size={theme.icon.xs}
                  color={theme.colors.textFaint}
                />
              </Pressable>
            ))
          ) : (
            <View
              style={[
                styles.entryEmpty,
                { borderTopColor: theme.colors.hairline },
              ]}
            >
              <Text
                style={{
                  fontFamily: resolveFont({
                    family: "sans",
                    weight: "300",
                    italic: true,
                  }),
                  fontSize: theme.fontSize.bodyMd,
                  color: theme.colors.textFaint,
                }}
              >
                No entries yet.
              </Text>
            </View>
          )}

          <Pressable
            onPress={onNewEntry}
            accessibilityRole="button"
            accessibilityLabel="New entry"
            style={({ pressed }) => [
              styles.newEntryButton,
              {
                borderColor: theme.colors.hairlineStrong,
                opacity: pressed ? 0.88 : 1,
              },
            ]}
          >
            <Text
              style={{
                fontFamily: resolveFont({ family: "sans", weight: "400" }),
                fontSize: theme.fontSize.bodySm,
                color: theme.colors.textPrimary,
                letterSpacing: theme.letterSpacing.uppercaseSm,
                textTransform: "uppercase",
              }}
            >
              + New entry
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>

      {!editing && (
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
            onPress={() => setConfirmDeleteQuote(true)}
            accessibilityRole="button"
            accessibilityLabel="Remove quote"
            hitSlop={8}
            style={styles.removeButton}
          >
            <Eyebrow
              size={theme.fontSize.eyebrowSm}
              color={theme.colors.textFaint}
            >
              Remove quote
            </Eyebrow>
          </Pressable>
        </View>
      )}

      <ConfirmDialog
        visible={confirmDeleteQuote}
        title="Remove this quote?"
        message="This will also remove any linked journal entries. This can't be undone."
        confirmLabel="Remove"
        pending={deleteMutation?.isPending ?? false}
        errorMessage={
          deleteMutation?.error ? "Couldn't remove. Try again." : null
        }
        onCancel={() => {
          deleteMutation?.reset();
          setConfirmDeleteQuote(false);
        }}
        onConfirm={() => deleteMutation?.mutate()}
      />
    </View>
  );
}

function formatDate(
  value: Date | string | undefined,
  options: Intl.DateTimeFormatOptions
): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString(undefined, options);
}

interface MetaRowProps {
  label: string;
  value: string;
}

function MetaRow({ label, value }: MetaRowProps) {
  const theme = useTheme();
  return (
    <View style={styles.metaRow}>
      <Eyebrow size={theme.fontSize.eyebrowSm}>{label}</Eyebrow>
      <Text
        style={{
          fontFamily: resolveFont({ family: "sans", weight: "400" }),
          fontSize: theme.fontSize.bodyMd,
          color: theme.colors.textPrimary,
          textAlign: "right",
          maxWidth: "70%",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

interface EditableMetaRowProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  keyboardType?: "default" | "number-pad";
}

function EditableMetaRow({
  label,
  value,
  onChangeText,
  onBlur,
  keyboardType = "default",
}: EditableMetaRowProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.editableMetaRow,
        { borderBottomColor: theme.colors.hairline },
      ]}
    >
      <Eyebrow size={theme.fontSize.eyebrowSm}>{label}</Eyebrow>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        keyboardType={keyboardType}
        autoCorrect={false}
        style={{
          flex: 1,
          fontFamily: resolveFont({ family: "sans", weight: "400" }),
          fontSize: theme.fontSize.bodyMd,
          color: theme.colors.textPrimary,
          textAlign: "right",
          padding: 0,
        }}
      />
    </View>
  );
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
  metaGroup: {
    gap: 14,
    marginBottom: 32,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  editableMetaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    gap: 14,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    marginBottom: 12,
  },
  tagWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: StyleSheet.hairlineWidth,
  },
  tagEditing: {
    backgroundColor: "transparent",
  },
  addTag: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 100,
    borderWidth: StyleSheet.hairlineWidth,
    borderStyle: "dashed",
    backgroundColor: "transparent",
  },
  entryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  entryRowText: {
    flex: 1,
    minWidth: 0,
  },
  entryEmpty: {
    paddingTop: 12,
    paddingBottom: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  newEntryButton: {
    marginTop: 16,
    paddingVertical: 14,
    borderRadius: 100,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
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
