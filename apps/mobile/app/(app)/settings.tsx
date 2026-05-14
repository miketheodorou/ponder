import { useAuth, useClerk, useUser } from '@clerk/expo';
import * as Clipboard from 'expo-clipboard';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  Gesture,
  GestureDetector,
  type PanGesture
} from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, Line, Path } from 'react-native-svg';

import { CloseIcon, Eyebrow, PrimaryButton } from '@/components';
import { resolveFont, useAppearance, useTheme, type Appearance } from '@/theme';

const LOGOUT_ERROR = "Couldn't sign out. Please try again.";

const SCRIM_TIMING = {
  duration: 320,
  easing: Easing.bezier(0.32, 0.72, 0, 1)
};
const PANEL_TIMING = {
  duration: 380,
  easing: Easing.bezier(0.32, 0.72, 0, 1)
};
const PANEL_WIDTH_FRACTION = 0.82;
const DISMISS_DRAG_THRESHOLD = 100;

/**
 * Left-slide settings drawer. Mounted as a transparentModal route so the
 * Home screen stays visible behind the scrim. The route animates its own
 * entrance and exit so it can match the design's left-drawer behaviour
 * (system modal presentations are bottom-up only).
 */
export default function SettingsScreen() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { getToken } = useAuth();

  // 0 = fully off-screen left, 1 = fully open. Drag offsets the panel
  // by raw px on top of the open value; on release we either spring back
  // to 1 or play the exit by easing to 0.
  const progress = useSharedValue(0);
  const dragX = useSharedValue(0);

  const { appearance, setAppearance } = useAppearance();

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    progress.value = withTiming(1, PANEL_TIMING);
  }, [progress]);

  const dismiss = () => {
    dragX.value = 0;
    progress.value = withTiming(0, PANEL_TIMING, (finished) => {
      if (finished) runOnJS(router.back)();
    });
  };

  const onLogout = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await signOut();
      // No success path here — once signOut resolves, the root layout's
      // <Stack.Protected> guard flips and this whole route unmounts. The
      // submitting state going stale is harmless because nothing rerenders.
    } catch (err: unknown) {
      const message =
        err instanceof Error && err.message ? err.message : LOGOUT_ERROR;
      setError(message);
      setSubmitting(false);
    }
  };

  // Dev-only convenience for grabbing a fresh JWT to paste into Postman /
  // curl while iterating on the backend. Stripped out of production bundles
  // because the entire block is guarded by `__DEV__`.
  //
  // We ask Clerk for the `dev` JWT template first — configured in the Clerk
  // dashboard with a long expiry — so a copied token lasts a debug session
  // instead of 60 seconds. If the template isn't set up, we fall back to
  // the default short-lived session token and surface that in the label
  // so it's clear which one landed in the clipboard.
  const DEV_TOKEN_TEMPLATE = 'dev';
  const [copyLabel, setCopyLabel] = useState('Copy session token');
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const onCopyToken = async () => {
    let nextLabel = copyLabel;
    try {
      let token: string | null = null;
      let usedTemplate = true;
      try {
        token = await getToken({ template: DEV_TOKEN_TEMPLATE });
      } catch {
        token = null;
      }
      if (!token) {
        usedTemplate = false;
        token = await getToken();
      }
      if (!token) {
        nextLabel = 'No active session';
      } else {
        await Clipboard.setStringAsync(token);
        nextLabel = usedTemplate ? 'Copied' : 'Copied (default)';
      }
    } catch {
      nextLabel = "Couldn't copy";
    }
    setCopyLabel(nextLabel);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => {
      setCopyLabel('Copy session token');
    }, 1800);
  };

  const panGesture: PanGesture = Gesture.Pan()
    .activeOffsetX([-10, 10])
    .onUpdate((e) => {
      // Only track leftward drag; rightward is ignored so the panel never
      // overshoots its open position.
      dragX.value = Math.min(0, e.translationX);
    })
    .onEnd(() => {
      if (dragX.value < -DISMISS_DRAG_THRESHOLD) {
        // User dragged past the dismiss threshold — fall through to exit.
        progress.value = withTiming(0, PANEL_TIMING, (finished) => {
          if (finished) runOnJS(router.back)();
        });
        dragX.value = withTiming(0, PANEL_TIMING);
      } else {
        // Snap the panel back home.
        dragX.value = withTiming(0, PANEL_TIMING);
      }
    });

  const scrimStyle = useAnimatedStyle(() => ({
    opacity: progress.value
  }));

  const panelStyle = useAnimatedStyle(() => {
    // Panel slides from -panelWidth (closed) to 0 (open), then drag
    // offsets are subtracted so a leftward drag pulls it further off.
    const offset = interpolate(progress.value, [0, 1], [-1, 0]);
    // Fade the drop shadow alongside the slide. The shadow is anchored to
    // the panel's right edge; without this it stays visible as a vertical
    // strip on screen-left after the panel slides off, then snaps away
    // when the route unmounts.
    return {
      transform: [{ translateX: offset * 100 + '%' }, { translateX: dragX.value }],
      shadowOpacity: progress.value * 0.5,
      elevation: progress.value * 24
    } as never;
  });

  const email =
    user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress ?? '';

  const cardActiveColor = theme.colors.textPrimary;
  const cardMutedColor = theme.colors.textMuted;

  return (
    <View style={styles.root} pointerEvents='box-none'>
      {/* Scrim — tap anywhere outside the panel to dismiss. */}
      <Animated.View
        style={[
          StyleSheet.absoluteFillObject,
          { backgroundColor: 'rgba(0,0,0,0.45)' },
          scrimStyle
        ]}
      >
        <Pressable
          style={StyleSheet.absoluteFillObject}
          onPress={dismiss}
          accessibilityRole='button'
          accessibilityLabel='Close settings'
        />
      </Animated.View>

      {/* Panel — left-side drawer, drag left to dismiss. */}
      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.panel,
            {
              width: `${PANEL_WIDTH_FRACTION * 100}%`,
              backgroundColor: theme.colors.backgroundRaised,
              paddingTop: insets.top + 32,
              paddingBottom: Math.max(insets.bottom + 32, 56)
            },
            panelStyle
          ]}
        >
          {/* Header — mirrors the eyebrow position on home. */}
          <View style={styles.header}>
            <Eyebrow>Settings</Eyebrow>
            <Pressable onPress={dismiss} hitSlop={12} style={styles.closeBtn}>
              <CloseIcon size={14} color={theme.colors.textMuted} />
            </Pressable>
          </View>

          {/* Appearance picker — three cards in a row. */}
          <View style={styles.section}>
            <Eyebrow size={theme.fontSize.eyebrowSm} style={styles.sectionLabel}>
              Appearance
            </Eyebrow>

            <View style={styles.cardRow}>
              {APPEARANCE_OPTIONS.map((opt) => {
                const active = appearance === opt.id;
                const fg = active ? cardActiveColor : cardMutedColor;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setAppearance(opt.id)}
                    style={[
                      styles.card,
                      {
                        backgroundColor: active
                          ? theme.colors.backgroundRaised2
                          : 'transparent',
                        borderColor: active
                          ? theme.colors.hairlineStrong
                          : theme.colors.hairline,
                        borderRadius: theme.radius.xl
                      }
                    ]}
                    accessibilityRole='radio'
                    accessibilityState={{ selected: active }}
                    accessibilityLabel={opt.label}
                  >
                    <opt.Icon color={fg} />
                    <Text
                      style={{
                        marginTop: 14,
                        fontFamily: resolveFont({ family: 'sans', weight: '400' }),
                        fontSize: theme.fontSize.bodyMd,
                        color: fg,
                        letterSpacing: theme.letterSpacing.loose
                      }}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.spacer} />

          {/* Account + logout pinned to the bottom. */}
          <View style={styles.footer}>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: resolveFont({ family: 'sans', weight: '400' }),
                fontSize: theme.fontSize.bodyMd,
                color: theme.colors.textMuted,
                letterSpacing: theme.letterSpacing.loose,
                marginBottom: 14,
                textAlign: 'center'
              }}
            >
              {email}
            </Text>

            <PrimaryButton
              variant='outline'
              label={submitting ? 'Signing out…' : 'Log out'}
              disabled={submitting}
              onPress={onLogout}
            />

            {error ? (
              <Text
                style={{
                  marginTop: 14,
                  fontFamily: resolveFont({ family: 'sans', weight: '400' }),
                  fontSize: theme.fontSize.bodySm,
                  lineHeight: theme.lineHeight.bodySm,
                  color: theme.colors.textPrimary,
                  textAlign: 'center'
                }}
              >
                {error}
              </Text>
            ) : null}

            {__DEV__ ? (
              <View style={styles.devRow}>
                <Pressable
                  onPress={onCopyToken}
                  hitSlop={8}
                  accessibilityRole='button'
                  accessibilityLabel='Copy session token (developer)'
                >
                  <Eyebrow
                    size={theme.fontSize.eyebrowSm}
                    color={theme.colors.textFaint}
                  >
                    {`Dev · ${copyLabel}`}
                  </Eyebrow>
                </Pressable>
              </View>
            ) : null}

            <View style={styles.versionRow}>
              <Eyebrow size={theme.fontSize.eyebrowSm} color={theme.colors.textFaint}>
                Ponder · v1.0
              </Eyebrow>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

interface AppearanceOption {
  id: Appearance;
  label: string;
  Icon: (props: { color: string }) => React.JSX.Element;
}

const APPEARANCE_OPTIONS: AppearanceOption[] = [
  {
    id: 'system',
    label: 'System',
    Icon: ({ color }) => (
      <Svg width={22} height={22} viewBox='0 0 22 22' fill='none'>
        <Circle cx={11} cy={11} r={9} stroke={color} strokeWidth={1.5} />
        <Path d='M11 2a9 9 0 0 0 0 18z' fill={color} />
      </Svg>
    )
  },
  {
    id: 'light',
    label: 'Light',
    Icon: ({ color }) => (
      <Svg width={22} height={22} viewBox='0 0 22 22' fill='none'>
        <Circle cx={11} cy={11} r={4} stroke={color} strokeWidth={1.5} />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
          const r1 = 7;
          const r2 = 9.5;
          const rad = (a * Math.PI) / 180;
          return (
            <Line
              key={a}
              x1={11 + r1 * Math.cos(rad)}
              y1={11 + r1 * Math.sin(rad)}
              x2={11 + r2 * Math.cos(rad)}
              y2={11 + r2 * Math.sin(rad)}
              stroke={color}
              strokeWidth={1.5}
              strokeLinecap='round'
            />
          );
        })}
      </Svg>
    )
  },
  {
    id: 'dark',
    label: 'Dark',
    Icon: ({ color }) => (
      <Svg width={22} height={22} viewBox='0 0 22 22' fill='none'>
        <Path d='M18 13.5A8 8 0 0 1 8.5 4a8 8 0 1 0 9.5 9.5z' fill={color} />
      </Svg>
    )
  }
];

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    flexDirection: 'column',
    // shadowOpacity + elevation are driven by progress in `panelStyle` so
    // the drop shadow fades with the slide instead of clinging to the
    // screen edge as the panel exits.
    shadowColor: '#000',
    shadowRadius: 32,
    shadowOffset: { width: 8, height: 0 }
  },
  header: {
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  closeBtn: {
    padding: 6,
    margin: -6
  },
  section: {
    paddingHorizontal: 28,
    paddingTop: 40
  },
  sectionLabel: {
    marginBottom: 14
  },
  cardRow: {
    flexDirection: 'row',
    gap: 10
  },
  card: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth
  },
  spacer: {
    flex: 1
  },
  footer: {
    paddingHorizontal: 28
  },
  devRow: {
    marginTop: 22,
    alignItems: 'center'
  },
  versionRow: {
    marginTop: 14,
    alignItems: 'center'
  }
});
