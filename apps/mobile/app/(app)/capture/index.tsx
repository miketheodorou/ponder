import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Eyebrow } from '@/components/Eyebrow';
import { resolveFont, useTheme } from '@/theme';

import { useCaptureDraft } from './_state';

const HORIZONTAL_GUTTER = 28;

export default function CaptureCameraScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setPhotoTaken } = useCaptureDraft();

  const onShutter = () => {
    // OCR will fill `text` here once the vision pipeline lands. Until then
    // the user lands on step 1 with an empty input — same path as Skip, just
    // labelled "Trim" instead of "Enter".
    setPhotoTaken(true);
    router.push('/capture/edit');
  };

  const onSkip = () => {
    setPhotoTaken(false);
    router.push('/capture/edit');
  };

  return (
    <View style={styles.flex}>
      <View
        style={[
          styles.viewfinder,
          {
            backgroundColor: '#050505',
            borderColor: theme.colors.hairline
          }
        ]}
      >
        <View style={styles.mockPage}>
          {[60, 90, 80, 50, 0, 75, 95, 40].map((w, i) => (
            <View
              key={i}
              style={{
                height: 5,
                width: w === 0 ? 0 : `${w}%`,
                borderRadius: 2,
                backgroundColor:
                  w === 0 ? 'transparent' : 'rgba(237, 232, 221, 0.18)'
              }}
            />
          ))}
        </View>

        <View
          style={[
            styles.cornerBase,
            styles.cornerTL,
            {
              borderTopColor: theme.colors.textPrimary,
              borderLeftColor: theme.colors.textPrimary
            }
          ]}
        />
        <View
          style={[
            styles.cornerBase,
            styles.cornerTR,
            {
              borderTopColor: theme.colors.textPrimary,
              borderRightColor: theme.colors.textPrimary
            }
          ]}
        />
        <View
          style={[
            styles.cornerBase,
            styles.cornerBL,
            {
              borderBottomColor: theme.colors.textPrimary,
              borderLeftColor: theme.colors.textPrimary
            }
          ]}
        />
        <View
          style={[
            styles.cornerBase,
            styles.cornerBR,
            {
              borderBottomColor: theme.colors.textPrimary,
              borderRightColor: theme.colors.textPrimary
            }
          ]}
        />

        <View style={styles.hint}>
          <Eyebrow size={theme.fontSize.eyebrowSm}>Frame the passage</Eyebrow>
        </View>
      </View>

      <View
        style={[
          styles.shutterRow,
          {
            paddingBottom: Math.max(insets.bottom, theme.spacing.giant)
          }
        ]}
      >
        <Pressable
          onPress={onShutter}
          accessibilityRole='button'
          accessibilityLabel='Capture passage'
          style={({ pressed }) => [
            styles.shutterRing,
            {
              borderColor: theme.colors.hairlineStrong,
              opacity: pressed ? 0.85 : 1
            }
          ]}
        >
          <View
            style={[
              styles.shutterCore,
              { backgroundColor: theme.colors.textPrimary }
            ]}
          />
        </Pressable>

        <Pressable
          onPress={onSkip}
          accessibilityRole='button'
          accessibilityLabel='Skip · enter manually'
          hitSlop={12}
          style={({ pressed }) => [
            styles.skip,
            { opacity: pressed ? 0.6 : 1 }
          ]}
        >
          <Eyebrow
            size={theme.fontSize.eyebrowSm}
            color={theme.colors.textFaint}
            style={{
              fontFamily: resolveFont({ family: 'sans', weight: '400' })
            }}
          >
            Skip · Enter manually
          </Eyebrow>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  viewfinder: {
    flex: 1,
    margin: HORIZONTAL_GUTTER - 6,
    marginTop: 32,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden'
  },
  mockPage: {
    position: 'absolute',
    top: '18%',
    left: '12%',
    right: '12%',
    bottom: '18%',
    borderRadius: 4,
    padding: 18,
    gap: 6,
    backgroundColor: 'rgba(237, 232, 221, 0.04)'
  },
  cornerBase: {
    position: 'absolute',
    width: 22,
    height: 22
  },
  cornerTL: {
    top: 22,
    left: 22,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5
  },
  cornerTR: {
    top: 22,
    right: 22,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5
  },
  cornerBL: {
    bottom: 22,
    left: 22,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5
  },
  cornerBR: {
    bottom: 22,
    right: 22,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5
  },
  hint: {
    position: 'absolute',
    top: 32,
    left: 0,
    right: 0,
    alignItems: 'center'
  },
  shutterRow: {
    paddingTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18
  },
  shutterRing: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 4
  },
  shutterCore: {
    flex: 1,
    borderRadius: 100
  },
  skip: {
    paddingVertical: 6,
    paddingHorizontal: 12
  }
});
