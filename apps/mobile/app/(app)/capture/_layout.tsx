import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';

import { Eyebrow } from '@/components/Eyebrow';
import { ChevronLeft, CloseIcon } from '@/components/icons';
import { useTheme } from '@/theme';

import { CaptureDraftProvider } from './_state';

const TOTAL_STEPS = 4;

const DOT_TIMING = {
  duration: 280,
  easing: Easing.bezier(0.32, 0.72, 0, 1)
};

// Map the current URL segment to its 0-indexed wizard step. The layout owns
// this derivation rather than each screen passing it up, so the progress dots
// and back-vs-close affordance stay in sync without a shared step variable.
function stepForSegment(last: string | undefined): number {
  if (last === 'edit') return 1;
  if (last === 'context') return 2;
  if (last === 'confirm') return 3;
  return 0;
}

export default function CaptureLayout() {
  const theme = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const step = stepForSegment(segments[segments.length - 1]);

  const onPressLeft = () => {
    if (step === 0) router.dismiss();
    else router.back();
  };

  return (
    <CaptureDraftProvider>
      <View style={[styles.root, { backgroundColor: theme.colors.background }]}>
        <View style={styles.topBar}>
          <Pressable
            onPress={onPressLeft}
            hitSlop={12}
            accessibilityRole='button'
            accessibilityLabel={step === 0 ? 'Close capture' : 'Back'}
            style={styles.topBarLeft}
          >
            {step === 0 ? (
              <CloseIcon
                size={theme.icon.md}
                color={theme.colors.textPrimary}
              />
            ) : (
              <ChevronLeft
                size={theme.icon.md}
                color={theme.colors.textPrimary}
                strokeWidth={1.4}
              />
            )}
          </Pressable>

          <Eyebrow size={theme.fontSize.eyebrowSm}>Capture</Eyebrow>

          <ProgressDots step={step} total={TOTAL_STEPS} />
        </View>

        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: theme.colors.background }
          }}
        >
          <Stack.Screen name='index' />
          <Stack.Screen name='edit' />
          <Stack.Screen name='context' />
          <Stack.Screen name='confirm' />
        </Stack>
      </View>
    </CaptureDraftProvider>
  );
}

interface ProgressDotsProps {
  step: number;
  total: number;
}

function ProgressDots({ step, total }: ProgressDotsProps) {
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length: total }, (_, i) => (
        <ProgressDot key={i} active={i === step} passed={i <= step} />
      ))}
    </View>
  );
}

interface ProgressDotProps {
  active: boolean;
  passed: boolean;
}

function ProgressDot({ active, passed }: ProgressDotProps) {
  const theme = useTheme();
  const width = useSharedValue(active ? 16 : 5);

  useEffect(() => {
    width.value = withTiming(active ? 16 : 5, DOT_TIMING);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({ width: width.value }));

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          backgroundColor: passed
            ? theme.colors.textPrimary
            : theme.colors.textFaint
        },
        animatedStyle
      ]}
    />
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1
  },
  topBar: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  topBarLeft: {
    padding: 8,
    marginLeft: -8
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center'
  },
  dot: {
    height: 5,
    borderRadius: 3
  }
});
