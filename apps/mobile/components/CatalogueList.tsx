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
import { SearchIcon } from "@/components/icons";
import { FILTER_CHIPS, type Quote, QUOTES } from "@/data/quotes";
import { resolveFont, useTheme } from "@/theme";

interface CatalogueListProps {
  onSelectQuote?: (quoteId: string) => void;
}

const HORIZONTAL_GUTTER = 28;

export function CatalogueList({ onSelectQuote }: CatalogueListProps) {
  const theme = useTheme();
  const [query, setQuery] = useState("");
  const [activeChip, setActiveChip] = useState<string>("all");

  const filtered = useMemo(() => filterQuotes(QUOTES, query, activeChip), [
    query,
    activeChip,
  ]);

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
          <Eyebrow>{`${QUOTES.length} quotes`}</Eyebrow>
        </View>

        <View
          style={[
            styles.searchWrap,
            {
              backgroundColor: theme.colors.backgroundRaised2,
              borderColor: theme.colors.hairline,
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
                  fontFamily: resolveFont({ family: "sans", weight: "400" }),
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
                  fontFamily: resolveFont({ family: "serif", weight: "400" }),
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
                  {`${quote.author} · ${quote.book}`}
                </Eyebrow>
                <Eyebrow
                  size={theme.fontSize.eyebrowSm}
                  color={theme.colors.textFaint}
                >
                  {quote.date.split(",")[0]}
                </Eyebrow>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function filterQuotes(quotes: Quote[], query: string, chip: string): Quote[] {
  let result = quotes;
  if (chip !== "all" && chip !== "recent") {
    result = result.filter((q) => q.tags.includes(chip));
  }
  const trimmed = query.trim().toLowerCase();
  if (trimmed) {
    result = result.filter(
      (q) =>
        q.text.toLowerCase().includes(trimmed) ||
        q.author.toLowerCase().includes(trimmed) ||
        q.book.toLowerCase().includes(trimmed)
    );
  }
  if (chip === "recent") {
    // Date.parse handles the "Mar 14, 2026"-style strings used in mock data.
    result = [...result].sort(
      (a, b) => Date.parse(b.date) - Date.parse(a.date)
    );
  }
  return result;
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
});
