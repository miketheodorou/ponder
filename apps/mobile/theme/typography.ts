// React Native picks fonts by family name only — there's no intrinsic
// `fontWeight` resolution against a single family. Each weight/style we use
// is loaded as its own concrete family from @expo-google-fonts (e.g.
// `DMSans_300Light_Italic`). This module is the single place that maps
// logical token inputs → concrete loaded family strings.
//
// Lora has no Light (300); requesting it falls back to Regular (400). DM Sans
// has the full range. Adding a new weight = add it to the loadable map below
// and (if the font supports it) extend the resolver.

import {
  Lora_400Regular,
  Lora_400Regular_Italic,
  Lora_500Medium,
  Lora_500Medium_Italic,
  Lora_600SemiBold,
  Lora_700Bold,
} from "@expo-google-fonts/lora";
import {
  DMSans_300Light,
  DMSans_300Light_Italic,
  DMSans_400Regular,
  DMSans_400Regular_Italic,
  DMSans_500Medium,
  DMSans_500Medium_Italic,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";

import type { FontFamilyKey, FontWeightKey } from "./tokens";

// ─────────────────────────────────────────────────────────────
// Loadable map — pass to expo-font's useFonts() in the root layout
// ─────────────────────────────────────────────────────────────
export const fontsToLoad = {
  Lora_400Regular,
  Lora_400Regular_Italic,
  Lora_500Medium,
  Lora_500Medium_Italic,
  Lora_600SemiBold,
  Lora_700Bold,

  DMSans_300Light,
  DMSans_300Light_Italic,
  DMSans_400Regular,
  DMSans_400Regular_Italic,
  DMSans_500Medium,
  DMSans_500Medium_Italic,
  DMSans_600SemiBold,
  DMSans_700Bold,
} as const;

// ─────────────────────────────────────────────────────────────
// Resolver
// ─────────────────────────────────────────────────────────────
const WEIGHT_WORD: Record<FontWeightKey, string> = {
  "300": "Light",
  "400": "Regular",
  "500": "Medium",
  "600": "SemiBold",
  "700": "Bold",
};

// Lora is shipped without a 300 weight; promote requests to 400.
const LORA_AVAILABLE_WEIGHTS = new Set<FontWeightKey>(["400", "500", "600", "700"]);

export interface FontStyle {
  family?: FontFamilyKey;
  weight?: FontWeightKey;
  italic?: boolean;
}

export function resolveFont({
  family = "sans",
  weight = "400",
  italic = false,
}: FontStyle = {}): string {
  if (family === "mono") return "Menlo";

  const stem = family === "serif" ? "Lora" : "DMSans";
  const effectiveWeight: FontWeightKey =
    family === "serif" && !LORA_AVAILABLE_WEIGHTS.has(weight) ? "400" : weight;

  const word = WEIGHT_WORD[effectiveWeight];
  return italic
    ? `${stem}_${effectiveWeight}${word}_Italic`
    : `${stem}_${effectiveWeight}${word}`;
}
