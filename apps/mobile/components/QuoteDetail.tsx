import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Eyebrow } from "@/components/Eyebrow";
import { ChevronRight } from "@/components/icons";
import { NavHeader } from "@/components/NavHeader";
import {
  ENTRIES,
  type JournalEntry as JournalEntryData,
  type Quote,
} from "@/data/quotes";
import { resolveFont, useTheme } from "@/theme";

interface QuoteDetailProps {
  quote: Quote | null;
  onBack: () => void;
  onOpenEntry?: (entryId: string) => void;
  onNewEntry?: () => void;
  /** Session entries linked to this quote — newest first. Pre-filtered by parent. */
  sessionEntries?: JournalEntryData[];
}

const HORIZONTAL_GUTTER = 28;

/**
 * Read view of a quote with two ephemeral edit affordances: tags can be
 * appended via an inline input on the "+ tag" pill, and notes can be edited
 * by tapping the body. Edits live in component state — no persistence yet,
 * since the data layer is still mock.
 */
export function QuoteDetail({
  quote,
  onBack,
  onOpenEntry,
  onNewEntry,
  sessionEntries = [],
}: QuoteDetailProps) {
  const theme = useTheme();

  // Ephemeral edit state. Reset on remount, which is acceptable until the
  // data layer is real.
  const [tags, setTags] = useState<string[]>(quote?.tags ?? []);
  const [editingTag, setEditingTag] = useState(false);
  const [tagDraft, setTagDraft] = useState("");

  const [notes, setNotes] = useState(quote?.notes ?? "");
  const [editingNotes, setEditingNotes] = useState(false);

  if (!quote) return null;

  const seededEntries = quote.entries
    .map((id) => ENTRIES[id])
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));
  // Session entries (newest first) sit above the seeded ones — what you just
  // saved should be at the top of the list.
  const linkedEntries = [...sessionEntries, ...seededEntries];

  const submitTag = () => {
    const trimmed = tagDraft.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags((prev) => [...prev, trimmed]);
    }
    setTagDraft("");
    setEditingTag(false);
  };

  return (
    <View style={styles.root}>
      <NavHeader onBack={onBack} label="Catalogue" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
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

        <View style={styles.metaGroup}>
          <MetaRow label="Author" value={quote.author} />
          <MetaRow label="Book" value={quote.book} />
          <MetaRow label="Page" value={String(quote.page)} />
          <MetaRow label="Saved" value={quote.date} />
        </View>

        <View style={styles.section}>
          <Eyebrow size={theme.fontSize.eyebrowSm} style={styles.sectionLabel}>
            Tags
          </Eyebrow>
          <View style={styles.tagWrap}>
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

        <View style={styles.section}>
          <Eyebrow size={theme.fontSize.eyebrowSm} style={styles.sectionLabel}>
            Notes
          </Eyebrow>
          {editingNotes ? (
            <TextInput
              value={notes}
              onChangeText={setNotes}
              onBlur={() => setEditingNotes(false)}
              autoFocus
              multiline
              placeholder="Add notes…"
              placeholderTextColor={theme.colors.textFaint}
              textAlignVertical="top"
              style={{
                // Edit mode is upright serif so the caret + selection feel
                // unambiguous; display flips back to italic on blur.
                fontFamily: resolveFont({ family: "serif", weight: "400" }),
                fontSize: theme.fontSize.serifMd,
                lineHeight: theme.lineHeight.serifMd,
                color: theme.colors.textPrimary,
                padding: 0,
                minHeight: theme.lineHeight.serifMd * 2,
              }}
            />
          ) : (
            <Pressable
              onPress={() => setEditingNotes(true)}
              accessibilityRole="button"
              accessibilityLabel={notes ? "Edit notes" : "Add notes"}
            >
              {notes ? (
                <Text
                  style={{
                    fontFamily: resolveFont({
                      family: "serif",
                      weight: "400",
                      italic: true,
                    }),
                    fontSize: theme.fontSize.serifMd,
                    lineHeight: theme.lineHeight.serifMd,
                    color: theme.colors.textPrimary,
                  }}
                >
                  {notes}
                </Text>
              ) : (
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
                  Add notes…
                </Text>
              )}
            </Pressable>
          )}
        </View>

        <View>
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
                    {entry.body.split("\n")[0]}
                  </Text>
                  <Eyebrow size={theme.fontSize.eyebrowSm}>{entry.date}</Eyebrow>
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
      </ScrollView>
    </View>
  );
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: HORIZONTAL_GUTTER,
    paddingTop: 24,
    paddingBottom: 60,
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
});
