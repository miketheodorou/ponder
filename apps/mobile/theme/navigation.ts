// Adapter: Ponder Theme → React Navigation Theme.
//
// React Navigation paints its own container background behind every screen
// (used during slide transitions and for any unfilled space). Without this
// wired to our tokens, you see white seams during navigation pushes.

import { DarkTheme, DefaultTheme } from "expo-router";

import type { Theme } from "./tokens";

// expo-router re-exports DarkTheme/DefaultTheme but not the React Navigation
// `Theme` type; derive it from the value (structurally identical).
type NavigationTheme = typeof DefaultTheme;

export function toNavigationTheme(theme: Theme): NavigationTheme {
  const base = theme.scheme === "dark" ? DarkTheme : DefaultTheme;
  return {
    ...base,
    dark: theme.scheme === "dark",
    colors: {
      ...base.colors,
      background: theme.colors.background,
      card: theme.colors.background,
      text: theme.colors.textPrimary,
      border: theme.colors.hairline,
      primary: theme.colors.textPrimary,
    },
  };
}
