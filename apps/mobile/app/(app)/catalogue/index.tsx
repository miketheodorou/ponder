import { useRouter } from "expo-router";
import { StyleSheet, View } from "react-native";

import { CatalogueList } from "@/components";
import { QUOTES } from "@/data/quotes";
import { useTheme } from "@/theme";

export default function CatalogueScreen() {
  const router = useRouter();
  const theme = useTheme();

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.colors.backgroundRaised },
      ]}
    >
      <CatalogueList
        quotes={QUOTES}
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
