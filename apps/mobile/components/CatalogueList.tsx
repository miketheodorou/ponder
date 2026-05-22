import type { Quote } from "@ponder/db/schema";
import { useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Eyebrow } from "@/components/Eyebrow";
import { PlusIcon, SearchIcon } from "@/components/icons";
import { FILTER_CHIPS } from "@/data/quotes";
import { resolveFont, useTheme } from "@/theme";

// In API responses `id` and `createdAt` are always present, even though
// the schema's $inferInsert type marks them optional (they have defaults
// at insert time). Narrow them here so the component doesn't need to
// guard.
type CatalogueQuote = Quote & {
  id: string;
  createdAt: Date | string;
  themes: string[];
};

interface CatalogueListProps {
  quotes: CatalogueQuote[];
  onSelectQuote?: (quoteId: string) => void;
  onCapture?: () => void;
}

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: "short",
  day: "numeric",
};

const HORIZONTAL_GUTTER = 28;

export function CatalogueList({
  quotes,
  onSelectQuote,
  onCapture,
}: CatalogueListProps) {
  const theme = useTheme();
  const [query, setQuery] = useState("");
  const [activeChip, setActiveChip] = useState<string>("all");

  const filtered = useMemo(
    () => filterQuotes(quotes, query, activeChip),
    [quotes, query, activeChip],
  );

  const isEmpty = quotes.length === 0;

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text
            style={{
              fontFamily: resolveFont({ family: "serif", weight: "400" }),
              fontSize: theme.fontSize.serif4xl,
              lineHeight: theme.lineHeight.serif4xl,
              letterSpacing: theme.letterSpacing.tightSerif,
              color: theme.colors.textPrimary,
            }}
          >
            Catalogue
          </Text>
          <Eyebrow>{`${quotes.length} quotes`}</Eyebrow>
        </View>

        <View
          style={[
            styles.searchWrap,
            {
              backgroundColor: theme.colors.backgroundRaised2,
              borderColor: theme.colors.hairline,
              opacity: isEmpty ? 0.5 : 1,
            },
          ]}
        >
          <SearchIcon size={theme.icon.sm} color={theme.colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search quotes, authors, books"
            placeholderTextColor={theme.colors.textFaint}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            editable={!isEmpty}
            style={[
              styles.searchInput,
              {
                color: theme.colors.textPrimary,
                fontFamily: resolveFont({ family: "sans", weight: "300" }),
                fontSize: theme.fontSize.bodyLg,
              },
            ]}
          />
        </View>
      </View>

      {isEmpty ? (
        <View style={styles.emptyWrap}>
          <Text
            style={{
              fontFamily: resolveFont({
                family: "serif",
                weight: "400",
                italic: true,
              }),
              fontSize: 19,
              lineHeight: 28,
              letterSpacing: theme.letterSpacing.tightSerif,
              color: theme.colors.textPrimary,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            Your catalogue starts here.
          </Text>
          <Text
            style={{
              fontFamily: resolveFont({ family: "sans", weight: "300" }),
              fontSize: theme.fontSize.bodyMd,
              lineHeight: theme.lineHeight.bodyLg,
              color: theme.colors.textMuted,
              textAlign: "center",
              maxWidth: 280,
              marginBottom: 28,
            }}
          >
            Save a passage and it lands here.
          </Text>
          <Pressable
            onPress={onCapture}
            accessibilityRole="button"
            accessibilityLabel="Capture a quote"
            style={({ pressed }) => [
              styles.capturePill,
              {
                backgroundColor: theme.colors.textPrimary,
                borderRadius: theme.radius.pill,
                opacity: pressed ? 0.88 : 1,
              },
            ]}
          >
            <PlusIcon size={12} color={theme.colors.background} />
            <Text
              style={{
                fontFamily: resolveFont({ family: "sans", weight: "500" }),
                fontSize: theme.fontSize.eyebrowMd,
                color: theme.colors.background,
                letterSpacing: theme.letterSpacing.uppercaseMd,
                textTransform: "uppercase",
              }}
            >
              Capture a quote
            </Text>
          </Pressable>
        </View>
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContent}
            style={styles.chipsScroll}
          >
            {FILTER_CHIPS.map((chip) => {
              const active = activeChip === chip.id;
              return (
                <Pressable
                  key={chip.id}
                  onPress={() => setActiveChip(chip.id)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: active
                        ? theme.colors.textPrimary
                        : "transparent",
                      borderColor: active
                        ? theme.colors.textPrimary
                        : theme.colors.hairlineStrong,
                    },
                  ]}
                >
                  <Text
                    style={{
                      fontFamily: resolveFont({
                        family: "sans",
                        weight: "400",
                      }),
                      fontSize: theme.fontSize.bodySm,
                      color: active
                        ? theme.colors.background
                        : theme.colors.textMuted,
                      letterSpacing:
                        chip.id === "all" || chip.id === "recent" ? 0.72 : 0.24,
                    }}
                  >
                    {chip.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            style={styles.list}
            keyboardShouldPersistTaps="handled"
          >
            {filtered.length === 0 ? (
              <Text
                style={{
                  fontFamily: resolveFont({ family: "sans", weight: "400" }),
                  fontSize: theme.fontSize.bodyMd,
                  color: theme.colors.textMuted,
                  textAlign: "center",
                  paddingVertical: theme.spacing.massive,
                }}
              >
                No quotes match.
              </Text>
            ) : (
              filtered.map((quote, index) => (
                <Pressable
                  key={quote.id}
                  onPress={() => onSelectQuote?.(quote.id)}
                  accessibilityRole="button"
                  style={[
                    styles.row,
                    index > 0 && {
                      borderTopWidth: StyleSheet.hairlineWidth,
                      borderTopColor: theme.colors.hairline,
                    },
                  ]}
                >
                  <Text
                    numberOfLines={2}
                    style={{
                      fontFamily: resolveFont({
                        family: "serif",
                        weight: "400",
                      }),
                      fontSize: theme.fontSize.serifLg,
                      lineHeight: theme.lineHeight.serifLg,
                      color: theme.colors.textPrimary,
                      marginBottom: 12,
                    }}
                  >
                    {`“${quote.text}”`}
                  </Text>
                  <View style={styles.meta}>
                    <Eyebrow size={theme.fontSize.eyebrowSm}>
                      {`${quote.authorName} · ${quote.bookTitle}`}
                    </Eyebrow>
                    <Eyebrow
                      size={theme.fontSize.eyebrowSm}
                      color={theme.colors.textFaint}
                    >
                      {formatQuoteDate(quote.createdAt)}
                    </Eyebrow>
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </>
      )}
    </View>
  );
}

function filterQuotes(
  quotes: CatalogueQuote[],
  query: string,
  chip: string,
): CatalogueQuote[] {
  let result = quotes;
  if (chip !== "all" && chip !== "recent") {
    result = result.filter((q) => q.themes.includes(chip));
  }
  const trimmed = query.trim().toLowerCase();
  if (trimmed) {
    result = result.filter(
      (q) =>
        q.text.toLowerCase().includes(trimmed) ||
        q.authorName.toLowerCase().includes(trimmed) ||
        q.bookTitle.toLowerCase().includes(trimmed),
    );
  }
  if (chip === "recent") {
    result = [...result].sort(
      (a, b) => toTime(b.createdAt) - toTime(a.createdAt),
    );
  }
  return result;
}

function toTime(value: Date | string | undefined): number {
  if (!value) return 0;
  return value instanceof Date ? value.getTime() : new Date(value).getTime();
}

function formatQuoteDate(value: Date | string | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return date.toLocaleDateString(undefined, DATE_FORMAT);
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    paddingHorizontal: HORIZONTAL_GUTTER,
    paddingTop: 8,
    paddingBottom: 18,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 18,
  },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  searchInput: {
    flex: 1,
    padding: 0,
  },
  chipsScroll: {
    flexGrow: 0,
  },
  chipsContent: {
    paddingHorizontal: HORIZONTAL_GUTTER,
    paddingBottom: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 7,
    borderRadius: 100,
    borderWidth: StyleSheet.hairlineWidth,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: HORIZONTAL_GUTTER,
    paddingBottom: 40,
  },
  row: {
    paddingVertical: 20,
  },
  meta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  emptyWrap: {
    flex: 1,
    paddingHorizontal: HORIZONTAL_GUTTER + 12,
    paddingBottom: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  capturePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 13,
    paddingLeft: 18,
    paddingRight: 22,
  },
});
