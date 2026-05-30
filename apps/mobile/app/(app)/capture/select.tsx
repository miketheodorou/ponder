import type { Rect } from '@infinitered/react-native-mlkit-text-recognition';
import { Image, type ImageLoadEventData } from 'expo-image';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  type LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';

import { Eyebrow } from '@/components/Eyebrow';
import { type OcrLine, reflowLines } from '@/lib/ocr';
import { resolveFont, useTheme } from '@/theme';

import { CaptureFooter } from './_components';
import { useCaptureDraft } from './_state';

const HORIZONTAL_GUTTER = 28;

interface FlatLine extends OcrLine {
  frame: Rect;
}

interface Size {
  width: number;
  height: number;
}

export default function CaptureSelectScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { form, shot } = useCaptureDraft();

  const [container, setContainer] = useState<Size | null>(null);
  const [image, setImage] = useState<Size | null>(null);
  const [selected, setSelected] = useState<ReadonlySet<number>>(new Set());

  // Flatten blocks → lines, keeping each line's pixel frame and parent block so
  // selected lines reflow with the right paragraph breaks.
  const lines = useMemo<FlatLine[]>(
    () =>
      (shot?.blocks ?? []).flatMap((block, blockIndex) =>
        block.lines.map((line) => ({
          text: line.text,
          blockIndex,
          frame: line.frame
        }))
      ),
    [shot]
  );

  // Map ML Kit's pixel coordinates onto the on-screen image. `contentFit:
  // 'contain'` centers the image inside the canvas, so we replicate that fit:
  // a single scale plus the letterbox offset on the constrained axis.
  const fit = useMemo(() => {
    if (!container || !image) return null;
    const scale = Math.min(
      container.width / image.width,
      container.height / image.height
    );
    const width = image.width * scale;
    const height = image.height * scale;
    return {
      scale,
      offsetX: (container.width - width) / 2,
      offsetY: (container.height - height) / 2
    };
  }, [container, image]);

  if (!shot) {
    // The camera step always sets a shot before routing here; nothing to show.
    return null;
  }

  const onCanvasLayout = (e: LayoutChangeEvent) =>
    setContainer({
      width: e.nativeEvent.layout.width,
      height: e.nativeEvent.layout.height
    });

  const onImageLoad = (e: ImageLoadEventData) =>
    setImage({ width: e.source.width, height: e.source.height });

  const toggle = (i: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const allSelected = lines.length > 0 && selected.size === lines.length;
  const toggleAll = () =>
    setSelected(allSelected ? new Set() : new Set(lines.map((_, i) => i)));

  const onNext = () => {
    // Reflow in reading order (lines are already top-to-bottom), not tap order.
    const chosen = lines.filter((_, i) => selected.has(i));
    form.setValue('text', reflowLines(chosen), { shouldValidate: true });
    router.push('/capture/edit');
  };

  return (
    <View style={styles.flex}>
      <View style={styles.stepHeader}>
        <Text
          style={{
            fontFamily: resolveFont({ family: 'serif', weight: '400' }),
            fontSize: theme.fontSize.serif2xl,
            lineHeight: theme.lineHeight.serif2xl,
            color: theme.colors.textPrimary,
            marginBottom: 8
          }}
        >
          Select the passage
        </Text>
        <Eyebrow size={theme.fontSize.eyebrowSm}>
          Tap the lines you want to keep.
        </Eyebrow>
      </View>

      <View
        style={[styles.canvas, { backgroundColor: '#050505' }]}
        onLayout={onCanvasLayout}
      >
        <Image
          source={{ uri: shot.uri }}
          style={StyleSheet.absoluteFill}
          contentFit='contain'
          onLoad={onImageLoad}
        />

        {fit
          ? lines.map((line, i) => {
              const isSelected = selected.has(i);
              return (
                <Pressable
                  key={i}
                  onPress={() => toggle(i)}
                  hitSlop={6}
                  accessibilityRole='button'
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={line.text}
                  style={[
                    styles.lineBox,
                    {
                      left: fit.offsetX + line.frame.left * fit.scale,
                      top: fit.offsetY + line.frame.top * fit.scale,
                      width: (line.frame.right - line.frame.left) * fit.scale,
                      height: (line.frame.bottom - line.frame.top) * fit.scale,
                      borderColor: isSelected
                        ? 'rgba(237, 232, 221, 0.95)'
                        : 'rgba(237, 232, 221, 0.4)',
                      backgroundColor: isSelected
                        ? 'rgba(237, 232, 221, 0.32)'
                        : 'rgba(5, 5, 5, 0.12)'
                    }
                  ]}
                />
              );
            })
          : null}
      </View>

      <Pressable
        onPress={toggleAll}
        hitSlop={8}
        accessibilityRole='button'
        style={({ pressed }) => [styles.selectAll, { opacity: pressed ? 0.6 : 1 }]}
      >
        <Eyebrow size={theme.fontSize.eyebrowSm} color={theme.colors.textMuted}>
          {allSelected ? 'Clear all' : 'Select all'}
        </Eyebrow>
      </Pressable>

      <CaptureFooter
        primary='Use selection'
        onPrimary={onNext}
        disabled={selected.size === 0}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1
  },
  stepHeader: {
    paddingHorizontal: HORIZONTAL_GUTTER,
    paddingTop: 32,
    paddingBottom: 16
  },
  canvas: {
    flex: 1,
    marginHorizontal: HORIZONTAL_GUTTER - 6,
    borderRadius: 18,
    overflow: 'hidden'
  },
  lineBox: {
    position: 'absolute',
    borderRadius: 3,
    borderWidth: 1
  },
  selectAll: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16
  }
});
