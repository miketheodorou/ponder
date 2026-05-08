# Architecture

apps/mobile/
 ├── theme/
 │ ├── tokens.ts # Color schemes, typography, spacing, radius, motion, control sizes
 │ ├── typography.ts # resolveFont(family,weight,italic) → loaded family + fontsToLoad map
 │ ├── ThemeProvider.tsx # Context + useTheme(); follows OS scheme, accepts override
 │ ├── navigation.ts # toNavigationTheme(theme) — adapter to @react-navigation/native Theme
 │ └── index.ts # Public re-exports
 ├── components/
 │ ├── CodeInput.tsx # 6-slot OTP grid backed by an invisible TextInput overlay
 │ ├── Eyebrow.tsx # Sans uppercase tracked label
 │ ├── Field.tsx # Eyebrow label + bottom-hairline TextInput, forwardRef'd
 │ ├── PrimaryButton.tsx # Pill CTA, solid + outline variants, disabled state
 │ └── index.ts
 └── app/
 ├── \_layout.tsx # Loads fonts; sets system-UI bg; wraps Stack in SafeAreaProvider + ThemeProvider + NavigationThemeProvider; StatusBar tracks scheme
 ├── index.tsx # Redirect → /welcome
 └── (auth)/
 ├── \_layout.tsx # Stack with no header, themed contentStyle background
 ├── welcome.tsx # Wordmark + tagline + "Sign in with email" → /email
 ├── email.tsx # "Sign in to Ponder" heading + Field + "Send code" → /code?email=…
 └── code.tsx # "Check your email" heading + CodeInput + Resend + Verify

## Key architectural choices

- **Tokens are values, presets come later.** `tokens.ts` is the verbatim spec from the design bundle, plus only what we've actually consumed: `serifDisplay: 64` (Welcome wordmark), `body2xl: 17` (form input text), `bodyLoose: 0.56` (tagline letter-spacing), `tightDisplay: -1.28` (wordmark letter-spacing). When component patterns repeat we'll add semantic presets (e.g. `theme.text.heroSerif`) — not yet.
- **Logical font names → concrete loaded names.** RN can't pick weights from one family, so `resolveFont({family:'sans', weight:'300', italic:true})` returns `'DMSans_300Light_Italic'`. Lora has no 300 weight; that case falls back to 400 inside the resolver instead of leaking into callers.
- **One source of truth for which fonts get loaded.** `fontsToLoad` from `theme/typography.ts` is what the root layout passes to `useFonts` — adding a new weight is a one-line change there.
- **ThemeProvider follows the OS scheme by default.** Both `ColorsDark` and `ColorsLight` are wired; switching is `<ThemeProvider scheme="light">` if we ever need it.
- **Three-layer background plumbing, all driven by tokens.** RN doesn't have an `<html>`-equivalent global background — there are three surfaces, and any of them being unset shows white seams during Stack push transitions:
  1. **Native window** — set via `expo-system-ui` (`SystemUI.setBackgroundColorAsync` in the root layout, re-runs when scheme changes).
  2. **React Navigation container theme** — `toNavigationTheme(theme)` adapts our Theme into the `@react-navigation/native` Theme shape (background, card, text, border, primary). Wrapped at the root with `<NavigationThemeProvider>`.
  3. **Stack `contentStyle.backgroundColor`** — set on every Stack (root and `(auth)`) so each screen's surface is themed even before the screen mounts its own `View`.
- **Top-anchor forms; don't fight the keyboard.** `KeyboardAvoidingView` on a vertically-centered form reflows the centered content as the keyboard rises — and that animation races the screen-push transition, which reads as jank. Forms are anchored from the top with explicit `paddingTop`; the keyboard slides up over the empty bottom area without moving anything. `autoFocus` on inputs works smoothly because the layout doesn't shift. If a form ever overflows on small devices, the fix is `ScrollView`, not KAV.
- **Safe-area handled at the screen.** The prototype's `paddingTop: 56` was a status-bar mock inside the device frame — on a real device that's `useSafeAreaInsets().top`. Bottom uses `Math.max(insets.bottom, theme.spacing.xxl)` to respect the home-indicator inset.

## Screen notes

- **welcome.tsx** maps directly to the prototype: 32px-tall blank eyebrow row at top (kept for symmetry with Email/Code), Lora-400 64pt wordmark with -1.28 letter-spacing, italic DM Sans Light tagline below, "Sign in with email" PrimaryButton + faint terms eyebrow at the bottom. Button pushes to `/email`.
- **email.tsx** is top-anchored (no `flex: 1 + justifyContent: 'center'`): brand "Ponder" eyebrow row, then `paddingTop: 56` and the heading/subtitle/Field/Button stack. `autoFocus` on the Field opens the keyboard immediately. Submit pushes to `/code` with the email passed as a route param.
- **code.tsx** mirrors email.tsx's layout (header + top-anchored form with `paddingTop: 56`), with the back button on the left of the header instead of an empty slot. Subtitle reads the email from `useLocalSearchParams` and renders it inline in `textPrimary` against the muted body. Verify is a no-op (no `/home` yet); auto-submits via `CodeInput`'s `onComplete` once the user enters the sixth digit, since the iOS number-pad has no return key.

## Component notes

- **Field** wraps the Eyebrow-label + bottom-hairline TextInput pattern used by both auth and the future capture flow. It `forwardRef`s the underlying `TextInput` so screens can focus programmatically. **Italic placeholder workaround:** RN can't style `placeholderTextColor` independently from the input text style, so Field swaps the input's `fontFamily` to the italic variant (e.g. `DMSans_300Light_Italic`) while the value is empty, and back to the upright variant once the user types. The placeholder inherits the input's font, so it renders italic; the user's text doesn't.
- **CodeInput** renders N visual slot Views with a single transparent `TextInput` absolutely positioned over them (`opacity: 0`, `caretHidden`, `selectionColor: 'transparent'`). Native taps focus the input; the OS keyboard handles all input mechanics. Non-digits are filtered inside the component, so consumers always get a clean numeric string. Active slot has a blinking caret driven by a `setInterval` (gated on focus). **Auto-fill:** `textContentType="oneTimeCode"` (iOS) and `autoComplete="sms-otp"` (Android) let the OS suggest codes received by SMS.
- **Inline chevron in code.tsx** is drawn with a rotated bordered square (`borderTopWidth + borderLeftWidth + transform: rotate(-45deg)`) rather than pulling in `react-native-svg` for a single glyph. When more icons land, replace with a real icon component — don't pile up rotated-border chevrons across the codebase.
