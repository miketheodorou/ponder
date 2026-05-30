import { CameraView, useCameraPermissions } from 'expo-camera';
import { recognizeText } from '@infinitered/react-native-mlkit-text-recognition';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  StyleSheet,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Eyebrow } from '@/components/Eyebrow';
import { BoltIcon } from '@/components/icons';
import { PrimaryButton } from '@/components/PrimaryButton';
import { resolveFont, useTheme } from '@/theme';

import { useCaptureDraft } from './_state';

const HORIZONTAL_GUTTER = 28;

export default function CaptureCameraScreen() {
  const theme = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { form, setPhotoTaken, setShot } = useCaptureDraft();

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [torch, setTorch] = useState(false);

  const granted = permission?.granted ?? false;

  const onAllowCamera = () => {
    // Once the user has permanently denied, the OS dialog won't show again —
    // send them to Settings instead.
    if (permission && !permission.canAskAgain) {
      void Linking.openSettings();
      return;
    }
    void requestPermission();
  };

  const onShutter = async () => {
    if (!granted || processing) return;
    setError(null);
    setProcessing(true);
    try {
      const photo = await cameraRef.current?.takePictureAsync({ quality: 1 });
      if (!photo?.uri) throw new Error('No photo captured');

      // On-device OCR. Hand the photo + recognized blocks to the `select` step,
      // where the user taps the exact lines that make up the passage.
      const result = await recognizeText(photo.uri);
      setPhotoTaken(true);
      setTorch(false); // light did its job for the shot; don't leave it lit

      if (result.blocks.length === 0) {
        // Nothing detected — skip selection and let them type it in.
        form.setValue('text', '', { shouldValidate: true });
        router.push('/capture/edit');
        return;
      }

      setShot({ uri: photo.uri, blocks: result.blocks });
      router.push('/capture/select');
    } catch {
      setError('Couldn’t read that. Try again, or enter it manually.');
    } finally {
      setProcessing(false);
    }
  };

  const onSkip = () => {
    setPhotoTaken(false);
    setShot(null);
    setTorch(false);
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
        {granted ? (
          <CameraView
            ref={cameraRef}
            style={StyleSheet.absoluteFill}
            enableTorch={torch}
          />
        ) : permission && !granted ? (
          <View style={styles.permissionPrompt}>
            <Eyebrow
              size={theme.fontSize.eyebrowSm}
              color={theme.colors.textMuted}
              style={styles.permissionCopy}
            >
              Ponder needs the camera to read passages from your books.
            </Eyebrow>
            <PrimaryButton
              label='Allow camera access'
              onPress={onAllowCamera}
              variant='outline'
            />
          </View>
        ) : null}

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

        {granted ? (
          <View style={styles.hint}>
            <Eyebrow size={theme.fontSize.eyebrowSm}>Frame the passage</Eyebrow>
          </View>
        ) : null}

        {processing ? (
          <View style={styles.processingOverlay}>
            <ActivityIndicator color={theme.colors.textPrimary} size='small' />
            <Eyebrow
              size={theme.fontSize.eyebrowSm}
              color={theme.colors.textMuted}
              style={{ marginTop: 12 }}
            >
              Reading the page…
            </Eyebrow>
          </View>
        ) : null}
      </View>

      <View
        style={[
          styles.shutterRow,
          {
            paddingBottom: Math.max(insets.bottom, theme.spacing.giant)
          }
        ]}
      >
        {error ? (
          <Eyebrow
            size={theme.fontSize.eyebrowSm}
            color={theme.colors.destructive}
            style={styles.error}
          >
            {error}
          </Eyebrow>
        ) : null}

        {granted ? (
          <View style={styles.controlsRow}>
            <Pressable
              onPress={() => setTorch((on) => !on)}
              accessibilityRole='button'
              accessibilityState={{ selected: torch }}
              accessibilityLabel={torch ? 'Turn off light' : 'Turn on light'}
              hitSlop={8}
              style={styles.sideSlot}
            >
              <View
                style={[
                  styles.torchButton,
                  {
                    borderColor: theme.colors.hairlineStrong,
                    backgroundColor: torch
                      ? theme.colors.textPrimary
                      : 'transparent'
                  }
                ]}
              >
                <BoltIcon
                  size={20}
                  color={
                    torch ? theme.colors.background : theme.colors.textPrimary
                  }
                  fill={torch ? theme.colors.background : 'none'}
                />
              </View>
            </Pressable>

            <Pressable
              onPress={onShutter}
              disabled={processing}
              accessibilityRole='button'
              accessibilityLabel='Capture passage'
              accessibilityState={{ disabled: processing, busy: processing }}
              style={({ pressed }) => [
                styles.shutterRing,
                {
                  borderColor: theme.colors.hairlineStrong,
                  opacity: processing ? 0.4 : pressed ? 0.85 : 1
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

            {/* Mirror the torch slot so the shutter stays centered. */}
            <View style={styles.sideSlot} />
          </View>
        ) : null}

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
    marginHorizontal: 10,
    marginTop: 16,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden'
  },
  permissionPrompt: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 20
  },
  permissionCopy: {
    textAlign: 'center'
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(5, 5, 5, 0.72)'
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
    paddingTop: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18
  },
  controlsRow: {
    alignSelf: 'stretch',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40
  },
  sideSlot: {
    width: 52,
    alignItems: 'center',
    justifyContent: 'center'
  },
  torchButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center'
  },
  error: {
    textAlign: 'center',
    paddingHorizontal: HORIZONTAL_GUTTER
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
