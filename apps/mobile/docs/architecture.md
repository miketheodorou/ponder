# Architecture

apps/mobile/  
 ├── theme/  
 │ ├── tokens.ts # Color schemes, typography, spacing, radius, motion, control sizes  
 │ ├── typography.ts # resolveFont(family,weight,italic) → loaded family + fontsToLoad map  
 │ ├── ThemeProvider.tsx # Context + useTheme(); follows OS scheme, accepts override  
 │ └── index.ts # Public re-exports  
 ├── components/  
 │ ├── Eyebrow.tsx # Sans uppercase tracked label  
 │ ├── PrimaryButton.tsx # Pill CTA, solid + outline variants, disabled state  
 │ └── index.ts  
 └── app/  
 ├── \_layout.tsx # Loads fonts via useFonts, holds splash, wraps in SafeAreaProvider + ThemeProvider, light StatusBar  
 ├── index.tsx # Redirect → /welcome  
 └── (auth)/  
 ├── \_layout.tsx # Stack with no header, themed background  
 └── welcome.tsx # The screen

## Key architectural choices

- Tokens are values, presets come later. tokens.ts is the verbatim spec from the bundle (plus a serifDisplay size for the wordmark and a bodyLoose letter-spacing for the tagline). When component patterns  
  repeat we'll add semantic presets (e.g. theme.text.heroSerif) — not yet.
- Logical font names → concrete loaded names. RN can't pick weights from one family, so resolveFont({family:'sans', weight:'300', italic:true}) returns 'DMSans_300Light_Italic'. Lora has no 300 weight; that  
  case falls back to 400 inside the resolver instead of leaking into callers.
- One source of truth for which fonts get loaded. fontsToLoad from theme/typography.ts is what the root layout passes to useFonts — adding a new weight is a one-line change there.
- ThemeProvider follows the OS scheme by default. Both ColorsDark and ColorsLight are wired; switching is <ThemeProvider scheme="light"> if we ever need it.
- Welcome treats safe-area properly. The prototype's paddingTop: 56 was a status-bar mock inside the device frame — on a real device that's useSafeAreaInsets().top. Bottom is the larger of the home-indicator  
  inset and 24.

Welcome.tsx maps directly to the prototype: 32px-tall blank eyebrow row at top (kept for symmetry with Email/Code), centered Lora-400 64pt wordmark with -1.28 letter-spacing, italic DM Sans Light tagline  
 below, primary "Sign in with email" button + faint terms eyebrow at the bottom. Button currently routes back to /welcome as a placeholder until the email screen exists.
