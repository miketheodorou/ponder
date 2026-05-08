// Ponder — Design Tokens
// Targeted at React Native (StyleSheet). All sizes are unitless numbers (DIPs).
// Extend by adding to the existing scales rather than introducing parallel ones —
// every component should be expressible in these tokens.

// ─────────────────────────────────────────────────────────────
// Colors — dark is primary, light is the secondary fallback
// ─────────────────────────────────────────────────────────────
export const ColorsDark = {
  background: "#0E0E0E",
  backgroundRaised: "#161513",
  backgroundRaised2: "#1C1B18",

  textPrimary: "#EDE8DD",
  textMuted: "#7A776E",
  textFaint: "#4A4843",

  hairline: "rgba(237, 232, 221, 0.08)",
  hairlineStrong: "rgba(237, 232, 221, 0.14)",

  scrim: "rgba(0, 0, 0, 0.35)",
} as const;

export const ColorsLight = {
  background: "#FAF7F1",
  backgroundRaised: "#F2EEE5",
  backgroundRaised2: "#E8E3D7",

  textPrimary: "#1A1916",
  textMuted: "#6B6860",
  textFaint: "#9B988F",

  hairline: "rgba(26, 25, 22, 0.08)",
  hairlineStrong: "rgba(26, 25, 22, 0.14)",

  scrim: "rgba(0, 0, 0, 0.25)",
} as const;

export type ColorScheme = {
  background: string;
  backgroundRaised: string;
  backgroundRaised2: string;
  textPrimary: string;
  textMuted: string;
  textFaint: string;
  hairline: string;
  hairlineStrong: string;
  scrim: string;
};

// ─────────────────────────────────────────────────────────────
// Typography
//
// React Native cannot pick a weight from a single family — each weight/style
// must be loaded as its own concrete font. `FontFamily.serif` / `.sans` are
// logical names; the resolver in ./typography.ts maps (family, weight, italic)
// to a loaded Google Fonts identifier (e.g. 'DMSans_300Light_Italic').
// ─────────────────────────────────────────────────────────────
export const FontFamily = {
  serif: "serif",
  sans: "sans",
  mono: "mono",
} as const;

export type FontFamilyKey = (typeof FontFamily)[keyof typeof FontFamily];

export const FontWeight = {
  light: "300",
  regular: "400",
  medium: "500",
  semibold: "600",
  bold: "700",
} as const;

export type FontWeightKey = (typeof FontWeight)[keyof typeof FontWeight];

export const FontSize = {
  eyebrowXs: 9,
  eyebrowSm: 10,
  eyebrowMd: 11,

  bodyXs: 11,
  bodySm: 12,
  bodyMd: 13,
  bodyLg: 14,
  bodyXl: 15,
  body2xl: 17,    // form input text

  serifSm: 13,
  serifMd: 15,
  serifLg: 17,
  serifXl: 18,
  serif2xl: 22,
  serif3xl: 24,
  serif4xl: 28,
  // Wordmark on Welcome — large display serif.
  serifDisplay: 64,
} as const;

// Line heights are absolute in RN; em multipliers are not allowed.
export const LineHeight = {
  bodyXs: 14,
  bodySm: 16,
  bodyMd: 18,
  bodyLg: 22, // 14 * 1.55 (welcome tagline / form copy)
  bodyXl: 22,

  serifSm: 20,
  serifMd: 23,
  serifLg: 27,
  serifXl: 26,
  serif2xl: 30,
  serif3xl: 33,
  serif4xl: 37,
  serifDisplay: 64, // wordmark line-height: 1
} as const;

// Letter spacing is absolute in RN; em units are not supported.
// Naming reflects intent (uppercaseLg) rather than the underlying em value.
export const LetterSpacing = {
  none: 0,
  tightSerif: -0.14, // -0.005em on serif body @ 28
  tightDisplay: -1.28, // -0.02em on serif display @ 64 (wordmark)
  loose: 0.14,
  uppercaseSm: 1.32, // 0.12em on 11px label
  uppercaseMd: 1.54, // 0.14em on 11px label
  uppercaseLg: 1.98, // 0.18em on 11px eyebrow
  bodyLoose: 0.56, // 0.04em on 14px body (welcome tagline)
} as const;

// ─────────────────────────────────────────────────────────────
// Spacing scale — loose 4-pt scale with a couple of bespoke gutters
// ─────────────────────────────────────────────────────────────
export const Spacing = {
  none: 0,
  xxs: 4,
  xs: 6,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 28, // primary page gutter
  huge: 32,
  massive: 40,
  giant: 56,
} as const;

// ─────────────────────────────────────────────────────────────
// Border radius
// ─────────────────────────────────────────────────────────────
export const BorderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 10,
  xl: 14,
  xxl: 18,
  sheet: 24,
  pill: 9999,
} as const;

// ─────────────────────────────────────────────────────────────
// Hairlines / borders
// ─────────────────────────────────────────────────────────────
export const BorderWidth = {
  hairline: 0.5,
  thin: 1,
  medium: 1.2,
  thick: 1.5,
} as const;

// ─────────────────────────────────────────────────────────────
// Animation timing (ms) and easings
// ─────────────────────────────────────────────────────────────
export const Motion = {
  fast: 180,
  base: 280,
  slow: 320,
  sheet: 380,
  bezierSheet: [0.32, 0.72, 0, 1] as const,
} as const;

// ─────────────────────────────────────────────────────────────
// Sizes (icon + control hit areas)
// ─────────────────────────────────────────────────────────────
export const IconSize = {
  xs: 11,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
} as const;

export const ControlSize = {
  shutter: 68,
  navButton: 32,
  dragHandleWidth: 36,
  dragHandleHeight: 4,
  progressDot: 5,
  progressDotActiveWidth: 16,
  buttonHeight: 48,
  hitSlop: 44,
} as const;

// ─────────────────────────────────────────────────────────────
// Aggregated theme — what useTheme() returns
// ─────────────────────────────────────────────────────────────
export type Theme = {
  scheme: "light" | "dark";
  colors: ColorScheme;
  fontFamily: typeof FontFamily;
  fontWeight: typeof FontWeight;
  fontSize: typeof FontSize;
  lineHeight: typeof LineHeight;
  letterSpacing: typeof LetterSpacing;
  spacing: typeof Spacing;
  radius: typeof BorderRadius;
  borderWidth: typeof BorderWidth;
  motion: typeof Motion;
  icon: typeof IconSize;
  control: typeof ControlSize;
};

export const ThemeDark: Theme = {
  scheme: "dark",
  colors: ColorsDark,
  fontFamily: FontFamily,
  fontWeight: FontWeight,
  fontSize: FontSize,
  lineHeight: LineHeight,
  letterSpacing: LetterSpacing,
  spacing: Spacing,
  radius: BorderRadius,
  borderWidth: BorderWidth,
  motion: Motion,
  icon: IconSize,
  control: ControlSize,
};

export const ThemeLight: Theme = {
  ...ThemeDark,
  scheme: "light",
  colors: ColorsLight,
};
