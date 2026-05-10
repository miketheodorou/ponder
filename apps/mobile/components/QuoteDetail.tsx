import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Eyebrow } from "@/components/Eyebrow";
import { ChevronLeft, ChevronRight } from "@/components/icons";
import { ENTRIES, type Quote } from "@/data/quotes";
import { resolveFont, useTheme } from "@/theme";

interface QuoteDetailProps {
  quote: Quote | null;
  onBack: () => void;
  onOpenEntry?: (entryId: string) => void;
  onNewEntry?: () => void;
}

const HORIZONTAL_GUTTER = 28;

export function QuoteDetail({
  quote,
  onBack,
  onOpenEntry,
  onNewEntry,
}: QuoteDetailProps) {
  const theme = useTheme();

  if (!quote) return null;

  const linkedEntries = quote.entries
    .map((id) => ENTRIES[id])
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  return (
    <View style={styles.root}>
      <View style={styles.navHeader}>
        <Pressable
          onPress={onBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back to catalogue"
          style={styles.back}
        >
          <ChevronLeft size={theme.icon.sm} color={theme.colors.textMuted} />
          <Eyebrow>Catalogue</Eyebrow>
        </Pressable>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
            {quote.tags.map((tag) => (
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
            {/* Add-tag affordance — purely visual until the tag editor lands. */}
            <View
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
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Eyebrow size={theme.fontSize.eyebrowSm} style={styles.sectionLabel}>
            Notes
          </Eyebrow>
          {quote.notes ? (
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
              {quote.notes}
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
              No notes yet.
            </Text>
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
  navHeader: {
    paddingHorizontal: 22,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
    paddingRight: 6,
    marginLeft: -6,
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
