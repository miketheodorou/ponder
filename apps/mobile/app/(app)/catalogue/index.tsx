import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { getQuotes } from "@/api/quotes";
import { CatalogueList } from "@/components";
import { useTheme } from "@/theme";

export default function CatalogueScreen() {
  const router = useRouter();
  const theme = useTheme();

  const { data: quotes } = useQuery({
    queryKey: ["quotes"],
    queryFn: getQuotes,
  });

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.colors.backgroundRaised },
      ]}
    >
      <CatalogueList
        quotes={quotes ?? []}
        onSelectQuote={(id) => router.push(`/catalogue/quote/${id}`)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
