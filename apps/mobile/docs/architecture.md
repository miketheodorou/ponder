# Architecture

apps/mobile/
 ├── theme/
 │ ├── tokens.ts # Color schemes, typography, spacing, radius, motion, control sizes
 │ ├── typography.ts # resolveFont(family,weight,italic) → loaded family + fontsToLoad map
 │ ├── ThemeProvider.tsx # Context + useTheme(); follows OS scheme, accepts override
 │ ├── navigation.ts # toNavigationTheme(theme) — adapter to @react-navigation/native Theme
 │ └── index.ts # Public re-exports
 ├── components/
 │ ├── CatalogueList.tsx # Search + filter chips + quote rows; filters by tag and query
 │ ├── CatalogueSheet.tsx # Bottom sheet shell — Reanimated slide + drag-to-dismiss handle, scrim
 │ ├── CodeInput.tsx # 6-slot OTP grid backed by an invisible TextInput overlay
 │ ├── Eyebrow.tsx # Sans uppercase tracked label
 │ ├── Field.tsx # Eyebrow label + bottom-hairline TextInput, forwardRef'd
 │ ├── icons.tsx # SVG icon set (PlusIcon, ChevronUp/Left/Right, CloseIcon, SearchIcon)
 │ ├── PrimaryButton.tsx # Pill CTA, solid + outline variants, disabled state
 │ └── index.ts
 ├── data/
 │ └── quotes.ts # Mock QUOTES, ENTRIES, FILTER_CHIPS — placeholder for the future API
 └── app/
 ├── \_layout.tsx # Loads fonts; sets system-UI bg; wraps Stack in SafeAreaProvider + ThemeProvider + NavigationThemeProvider; StatusBar tracks scheme
 ├── index.tsx # Redirect → /welcome (or /home when EXPO_PUBLIC_BYPASS_AUTH=1)
 ├── (auth)/
 │ ├── \_layout.tsx # Stack with no header, themed contentStyle background
 │ ├── welcome.tsx # Wordmark + tagline + "Sign in with email" → /email
 │ ├── email.tsx # "Sign in to Ponder" heading + Field + "Send code" → /code?email=…
 │ └── code.tsx # "Check your email" heading + CodeInput + Resend + Verify
 └── (app)/
 ├── \_layout.tsx # Stack with no header, themed contentStyle background
 └── home.tsx # Header (Ponder + plus) / centered hero quote / footer (author·book + hairline + Swipe for Catalogue)

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
- **Icons are SVG, centralized in `components/icons.tsx`.** All glyphs share an `IconProps` shape (`size`, `color`, `strokeWidth`) and use the same stroke styling so weights stay consistent across screens. Replaces the rotated-border chevron approach used in `code.tsx`; that screen still uses the local one and can be migrated when convenient.
- **Auth bypass flag.** `EXPO_PUBLIC_BYPASS_AUTH=1` (in `apps/mobile/.env.local`) makes the root index redirect to `/home` instead of `/welcome`, so we can iterate on app screens without going through the auth flow each time. Real auth will replace this when the API is wired up. `.env.example` documents the var; `.env*.local` is already gitignored at the repo root.
- **Sheets are state-managed overlays, not router modals.** The catalogue is mounted as an absolute-positioned sibling on `home.tsx`, opened by setting state. Mirrors the prototype's intent (the swipe-up gesture starts on home and continues into the sheet) and lets us hand-tune the slide animation precisely; we'd be fighting expo-router's modal default otherwise. If we add a second sheet later (e.g. capture-as-sheet) and the pattern repeats, factor a generic `Sheet` shell — for now `CatalogueSheet` is the only one and owns its own animation.
- **Sheet animation = Reanimated, gestures = GH.** `react-native-reanimated` and `react-native-gesture-handler` are wired at the root via `GestureHandlerRootView` in `app/_layout.tsx`. The catalogue sheet uses `useSharedValue` + `withTiming` for the open/close transition, and `Gesture.Pan` on the drag-handle area for drag-to-dismiss (release past 120pt of translation, or 800 px/s downward velocity, closes). Drag is restricted to the handle area only — the list inside the sheet scrolls freely without fighting the sheet gesture, which is the trickiest piece of a generic sheet to get right and worth skipping until we need it. Home uses a `Gesture.Fling().direction(Directions.UP)` to open the sheet on swipe-up; tap on the bottom catalogue control does the same — both feed the same state.

## Screen notes

- **home.tsx** is the post-auth landing screen. Header is a `Ponder` eyebrow on the left and a 32×32 plus button on the right (calls `onAdd` — capture modal is not wired yet). The hero quote is rendered in Lora-400 at `serif4xl` (28pt), with `tightSerif` letter-spacing and a `marginTop: -32` optical lift so it reads slightly above true center. Footer stack: author·book eyebrow → full-width 0.5px hairline (uses `StyleSheet.hairlineWidth` so it stays crisp on every density) → centered `ChevronUp` + `Swipe for Catalogue` eyebrow (tap to open the catalogue sheet; swipe-up anywhere on the screen does the same via a `Fling` gesture). Mounts `CatalogueSheet` as a sibling overlay; `catalogueOpen` state lives on the screen. Uses `Math.max(insets.bottom, spacing.giant)` for the bottom inset to clear the home indicator. Hero quote is currently hardcoded to `q1`.
- **welcome.tsx** maps directly to the prototype: 32px-tall blank eyebrow row at top (kept for symmetry with Email/Code), Lora-400 64pt wordmark with -1.28 letter-spacing, italic DM Sans Light tagline below, "Sign in with email" PrimaryButton + faint terms eyebrow at the bottom. Button pushes to `/email`.
- **email.tsx** is top-anchored (no `flex: 1 + justifyContent: 'center'`): brand "Ponder" eyebrow row, then `paddingTop: 56` and the heading/subtitle/Field/Button stack. `autoFocus` on the Field opens the keyboard immediately. Submit pushes to `/code` with the email passed as a route param.
- **code.tsx** mirrors email.tsx's layout (header + top-anchored form with `paddingTop: 56`), with the back button on the left of the header instead of an empty slot. Subtitle reads the email from `useLocalSearchParams` and renders it inline in `textPrimary` against the muted body. Verify is a no-op (no `/home` yet); auto-submits via `CodeInput`'s `onComplete` once the user enters the sixth digit, since the iOS number-pad has no return key.

## Component notes

- **Field** wraps the Eyebrow-label + bottom-hairline TextInput pattern used by both auth and the future capture flow. It `forwardRef`s the underlying `TextInput` so screens can focus programmatically. **Italic placeholder workaround:** RN can't style `placeholderTextColor` independently from the input text style, so Field swaps the input's `fontFamily` to the italic variant (e.g. `DMSans_300Light_Italic`) while the value is empty, and back to the upright variant once the user types. The placeholder inherits the input's font, so it renders italic; the user's text doesn't.
- **CodeInput** renders N visual slot Views with a single transparent `TextInput` absolutely positioned over them (`opacity: 0`, `caretHidden`, `selectionColor: 'transparent'`). Native taps focus the input; the OS keyboard handles all input mechanics. Non-digits are filtered inside the component, so consumers always get a clean numeric string. Active slot has a blinking caret driven by a `setInterval` (gated on focus). **Auto-fill:** `textContentType="oneTimeCode"` (iOS) and `autoComplete="sms-otp"` (Android) let the OS suggest codes received by SMS.
- **Inline chevron in code.tsx** is drawn with a rotated bordered square (`borderTopWidth + borderLeftWidth + transform: rotate(-45deg)`) rather than pulling in `react-native-svg` for a single glyph. When more icons land, replace with a real icon component — don't pile up rotated-border chevrons across the codebase.
- **CatalogueSheet** is a 92%-of-viewport bottom sheet. The shared value `translateY` drives both the sheet's transform and the scrim's opacity (interpolated 0→1 as the sheet rises). The component mounts in both open and closed states; `pointerEvents` toggles between `auto` and `none` on the wrapper based on the `open` prop so it doesn't block taps on home when closed. Drag-to-dismiss only listens on the handle area (`Gesture.Pan().activeOffsetY(10)`) so the list inside scrolls without fighting the sheet. Composes `CatalogueList` for now; when detail/journal land, this is where the internal nav stack will live.
- **CatalogueList** owns its own `query`/`activeChip` state. Tag filter logic mirrors the prototype: `all` and `recent` ignore the tag filter; everything else filters `quote.tags.includes(chip.id)`. Search matches case-insensitively against text/author/book. Filter chips are a horizontal `ScrollView` (8 items — virtualization unnecessary). Quote rows are a vertical `ScrollView` with hairline dividers between rows; the first row has no top border. `keyboardShouldPersistTaps="handled"` lets users tap a row while the search keyboard is open without it dismissing first.
