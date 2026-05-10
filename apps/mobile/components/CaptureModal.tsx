import { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Eyebrow } from "@/components/Eyebrow";
import { ChevronLeft, CloseIcon } from "@/components/icons";
import { PrimaryButton } from "@/components/PrimaryButton";
import { resolveFont, useTheme } from "@/theme";

// Mock OCR result. Step 1 trims this down to just the quote — replaced by
// real OCR output once the camera is wired to a vision API.
const OCR_SAMPLE = `Twilight of the Idols
or, How to Philosophize with a Hammer

Maxims and Arrows
12.

If we have our own why in life, we shall get along with almost any how. — Man does not strive after happiness; only the Englishman does that.

He who has a why to live can bear almost any how.

13.`;

const OPEN_TIMING = {
  duration: 380,
  easing: Easing.bezier(0.32, 0.72, 0, 1),
};
const DOT_TIMING = {
  duration: 280,
  easing: Easing.bezier(0.32, 0.72, 0, 1),
};

const HORIZONTAL_GUTTER = 28;
// -0.005em on 17pt body — matches the prototype's tracking on the OCR editor.
const BODY_TRACKING = -0.085;

export interface CaptureSavedQuote {
  text: string;
  book: string;
  author: string;
  page: string;
}

interface CaptureModalProps {
  open: boolean;
  onClose: () => void;
  /** Called with the captured fields once the user confirms Save. */
  onSave: (quote: CaptureSavedQuote) => void;
}

/**
 * 4-step capture flow: camera → trim → context → confirm. The modal itself
 * stays mounted for the lifetime of the home screen so book/author values
 * persist across captures (the "pre-filled from your last capture" hint on
 * the context step). Only `text` and `page` reset on each open — those are
 * specific to the new capture; book/author are commonly the same source.
 */
export function CaptureModal({ open, onClose, onSave }: CaptureModalProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();

  const [step, setStep] = useState(0);
  const [text, setText] = useState("");
  // Defaults match the prototype's "last capture" state — feel free to wipe
  // them if the user-facing copy ever drops the implication.
  const [book, setBook] = useState("Twilight of the Idols");
  const [author, setAuthor] = useState("Nietzsche");
  const [page, setPage] = useState("");

  const translateY = useSharedValue(windowHeight);

  useEffect(() => {
    translateY.value = withTiming(open ? 0 : windowHeight, OPEN_TIMING);
    if (open) {
      setStep(0);
      setText("");
      setPage("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, windowHeight]);

  const next = () => setStep((s) => Math.min(s + 1, 3));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const onCapture = () => {
    setText(OCR_SAMPLE);
    next();
  };

  const onPressLeft = () => {
    if (step === 0) onClose();
    else back();
  };

  const onConfirmSave = () => {
    onSave({ text: text.trim(), book, author, page });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      pointerEvents={open ? "auto" : "none"}
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: theme.colors.background },
        animatedStyle,
      ]}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.flex}
      >
        <View style={[styles.topBar, { paddingTop: insets.top }]}>
          <Pressable
            onPress={onPressLeft}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel={step === 0 ? "Close capture" : "Back"}
            style={styles.topBarLeft}
          >
            {step === 0 ? (
              <CloseIcon size={theme.icon.md} color={theme.colors.textPrimary} />
            ) : (
              <ChevronLeft
                size={theme.icon.md}
                color={theme.colors.textPrimary}
                strokeWidth={1.4}
              />
            )}
          </Pressable>

          <Eyebrow size={theme.fontSize.eyebrowSm}>Capture</Eyebrow>

          <ProgressDots step={step} total={4} />
        </View>

        <View style={styles.flex}>
          {step === 0 && <CaptureStepCamera onCapture={onCapture} />}
          {step === 1 && (
            <CaptureStepEdit text={text} setText={setText} onNext={next} />
          )}
          {step === 2 && (
            <CaptureStepContext
              book={book}
              setBook={setBook}
              author={author}
              setAuthor={setAuthor}
              page={page}
              setPage={setPage}
              onNext={next}
            />
          )}
          {step === 3 && (
            <CaptureStepConfirm
              text={text}
              book={book}
              author={author}
              page={page}
              onSave={onConfirmSave}
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Top bar — progress dots
// ─────────────────────────────────────────────────────────────────────────────

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
            : theme.colors.textFaint,
        },
        animatedStyle,
      ]}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 0 — Camera
// ─────────────────────────────────────────────────────────────────────────────

interface CameraStepProps {
  onCapture: () => void;
}

function CaptureStepCamera({ onCapture }: CameraStepProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.flex}>
      {/* Viewfinder — visual mock; no real camera until expo-camera lands. */}
      <View
        style={[
          styles.viewfinder,
          {
            backgroundColor: "#050505",
            borderColor: theme.colors.hairline,
          },
        ]}
      >
        {/* Mock book page (text bars) */}
        <View style={styles.mockPage}>
          {[60, 90, 80, 50, 0, 75, 95, 40].map((w, i) => (
            <View
              key={i}
              style={{
                height: 5,
                width: w === 0 ? 0 : `${w}%`,
                borderRadius: 2,
                backgroundColor:
                  w === 0 ? "transparent" : "rgba(237, 232, 221, 0.18)",
              }}
            />
          ))}
        </View>

        {/* Frame corners */}
        <View
          style={[
            styles.cornerBase,
            styles.cornerTL,
            {
              borderTopColor: theme.colors.textPrimary,
              borderLeftColor: theme.colors.textPrimary,
            },
          ]}
        />
        <View
          style={[
            styles.cornerBase,
            styles.cornerTR,
            {
              borderTopColor: theme.colors.textPrimary,
              borderRightColor: theme.colors.textPrimary,
            },
          ]}
        />
        <View
          style={[
            styles.cornerBase,
            styles.cornerBL,
            {
              borderBottomColor: theme.colors.textPrimary,
              borderLeftColor: theme.colors.textPrimary,
            },
          ]}
        />
        <View
          style={[
            styles.cornerBase,
            styles.cornerBR,
            {
              borderBottomColor: theme.colors.textPrimary,
              borderRightColor: theme.colors.textPrimary,
            },
          ]}
        />

        {/* Hint */}
        <View style={styles.hint}>
          <Eyebrow size={theme.fontSize.eyebrowSm}>Frame the passage</Eyebrow>
        </View>
      </View>

      {/* Shutter */}
      <View
        style={[
          styles.shutterRow,
          {
            paddingBottom: Math.max(insets.bottom, theme.spacing.giant),
          },
        ]}
      >
        <Pressable
          onPress={onCapture}
          accessibilityRole="button"
          accessibilityLabel="Capture passage"
          style={({ pressed }) => [
            styles.shutterRing,
            {
              borderColor: theme.colors.hairlineStrong,
              opacity: pressed ? 0.85 : 1,
            },
          ]}
        >
          <View
            style={[
              styles.shutterCore,
              { backgroundColor: theme.colors.textPrimary },
            ]}
          />
        </Pressable>
      </View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 1 — Edit OCR text
// ─────────────────────────────────────────────────────────────────────────────

interface EditStepProps {
  text: string;
  setText: (t: string) => void;
  onNext: () => void;
}

function CaptureStepEdit({ text, setText, onNext }: EditStepProps) {
  const theme = useTheme();
  return (
    <View style={styles.flex}>
      <View style={styles.stepHeader}>
        <Text
          style={{
            fontFamily: resolveFont({ family: "serif", weight: "400" }),
            fontSize: theme.fontSize.serif2xl,
            lineHeight: theme.lineHeight.serif2xl,
            color: theme.colors.textPrimary,
            marginBottom: 8,
          }}
        >
          Trim to the quote
        </Text>
        <Eyebrow size={theme.fontSize.eyebrowSm}>
          Edit until only the passage you want to keep remains.
        </Eyebrow>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.editScrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <TextInput
          value={text}
          onChangeText={setText}
          autoFocus
          multiline
          textAlignVertical="top"
          placeholder="—"
          placeholderTextColor={theme.colors.textFaint}
          style={{
            minHeight: 320,
            padding: 0,
            fontFamily: resolveFont({ family: "serif", weight: "400" }),
            fontSize: theme.fontSize.serifLg,
            lineHeight: theme.lineHeight.serifLg,
            letterSpacing: BODY_TRACKING,
            color: theme.colors.textPrimary,
          }}
        />
      </ScrollView>

      <CaptureFooter
        primary="Next"
        onPrimary={onNext}
        disabled={!text.trim()}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 2 — Context (book, author, page)
// ─────────────────────────────────────────────────────────────────────────────

interface ContextStepProps {
  book: string;
  setBook: (s: string) => void;
  author: string;
  setAuthor: (s: string) => void;
  page: string;
  setPage: (s: string) => void;
  onNext: () => void;
}

function CaptureStepContext({
  book,
  setBook,
  author,
  setAuthor,
  page,
  setPage,
  onNext,
}: ContextStepProps) {
  const theme = useTheme();
  return (
    <View style={styles.flex}>
      <View style={[styles.stepHeader, { paddingBottom: 28 }]}>
        <Text
          style={{
            fontFamily: resolveFont({ family: "serif", weight: "400" }),
            fontSize: theme.fontSize.serif2xl,
            lineHeight: theme.lineHeight.serif2xl,
            color: theme.colors.textPrimary,
            marginBottom: 8,
          }}
        >
          Where is it from?
        </Text>
        <Eyebrow size={theme.fontSize.eyebrowSm}>
          Pre-filled from your last capture.
        </Eyebrow>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.contextScrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <CaptureField label="Book" value={book} onChange={setBook} />
        <CaptureField label="Author" value={author} onChange={setAuthor} />
        <CaptureField
          label="Page"
          value={page}
          onChange={setPage}
          placeholder="—"
          numeric
        />
      </ScrollView>

      <CaptureFooter
        primary="Next"
        onPrimary={onNext}
        disabled={!book.trim() || !author.trim()}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step 3 — Confirm
// ─────────────────────────────────────────────────────────────────────────────

interface ConfirmStepProps {
  text: string;
  book: string;
  author: string;
  page: string;
  onSave: () => void;
}

function CaptureStepConfirm({
  text,
  book,
  author,
  page,
  onSave,
}: ConfirmStepProps) {
  const theme = useTheme();
  return (
    <View style={styles.flex}>
      <View style={[styles.stepHeader, { paddingBottom: 24 }]}>
        <Text
          style={{
            fontFamily: resolveFont({ family: "serif", weight: "400" }),
            fontSize: theme.fontSize.serif2xl,
            lineHeight: theme.lineHeight.serif2xl,
            color: theme.colors.textPrimary,
            marginBottom: 8,
          }}
        >
          Ready to save
        </Text>
        <Eyebrow size={theme.fontSize.eyebrowSm}>
          You can add tags and notes later.
        </Eyebrow>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.confirmScrollContent}
      >
        <View
          style={[
            styles.confirmCard,
            {
              backgroundColor: theme.colors.backgroundRaised,
              borderColor: theme.colors.hairline,
            },
          ]}
        >
          <Text
            style={{
              fontFamily: resolveFont({ family: "serif", weight: "400" }),
              fontSize: theme.fontSize.serifXl,
              lineHeight: theme.lineHeight.serifXl,
              color: theme.colors.textPrimary,
              marginBottom: 24,
            }}
          >
            {`“${text.trim() || "—"}”`}
          </Text>
          <View
            style={[
              styles.confirmDivider,
              { backgroundColor: theme.colors.hairline },
            ]}
          />
          <View style={styles.confirmRows}>
            <ConfirmRow label="Book" value={book || "—"} />
            <ConfirmRow label="Author" value={author || "—"} />
            <ConfirmRow label="Page" value={page || "—"} />
          </View>
        </View>
      </ScrollView>

      <CaptureFooter primary="Save" onPrimary={onSave} />
    </View>
  );
}

interface ConfirmRowProps {
  label: string;
  value: string;
}

function ConfirmRow({ label, value }: ConfirmRowProps) {
  const theme = useTheme();
  return (
    <View style={styles.confirmRow}>
      <Eyebrow size={theme.fontSize.eyebrowSm}>{label}</Eyebrow>
      <Text
        style={{
          fontFamily: resolveFont({ family: "sans", weight: "400" }),
          fontSize: theme.fontSize.bodyMd,
          color: theme.colors.textPrimary,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Footer (shared by Edit / Context / Confirm)
// ─────────────────────────────────────────────────────────────────────────────

interface CaptureFooterProps {
  primary: string;
  onPrimary: () => void;
  disabled?: boolean;
}

function CaptureFooter({ primary, onPrimary, disabled }: CaptureFooterProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      style={[
        styles.footer,
        {
          borderTopColor: theme.colors.hairline,
          paddingBottom: Math.max(insets.bottom, theme.spacing.giant) - 24,
        },
      ]}
    >
      <PrimaryButton label={primary} onPress={onPrimary} disabled={disabled} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Field row (Book / Author / Page)
// ─────────────────────────────────────────────────────────────────────────────

interface CaptureFieldProps {
  label: string;
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
  numeric?: boolean;
}

function CaptureField({
  label,
  value,
  onChange,
  placeholder,
  numeric,
}: CaptureFieldProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.field,
        { borderBottomColor: theme.colors.hairline },
      ]}
    >
      <View style={styles.fieldLabel}>
        <Eyebrow size={theme.fontSize.eyebrowSm}>{label}</Eyebrow>
      </View>
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textFaint}
        keyboardType={numeric ? "number-pad" : "default"}
        autoCorrect={!numeric}
        style={{
          flex: 1,
          padding: 0,
          fontFamily: resolveFont({ family: "sans", weight: "300" }),
          fontSize: theme.fontSize.bodyXl,
          color: theme.colors.textPrimary,
        }}
      />
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  flex: { flex: 1 },

  topBar: {
    paddingHorizontal: 22,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  topBarLeft: {
    padding: 8,
    marginLeft: -8,
  },
  dotsRow: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  dot: {
    height: 5,
    borderRadius: 3,
  },

  // Camera
  viewfinder: {
    flex: 1,
    margin: HORIZONTAL_GUTTER - 6,
    marginTop: 32,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  mockPage: {
    position: "absolute",
    top: "18%",
    left: "12%",
    right: "12%",
    bottom: "18%",
    borderRadius: 4,
    padding: 18,
    gap: 6,
    backgroundColor: "rgba(237, 232, 221, 0.04)",
  },
  cornerBase: {
    position: "absolute",
    width: 22,
    height: 22,
  },
  cornerTL: {
    top: 22,
    left: 22,
    borderTopWidth: 1.5,
    borderLeftWidth: 1.5,
  },
  cornerTR: {
    top: 22,
    right: 22,
    borderTopWidth: 1.5,
    borderRightWidth: 1.5,
  },
  cornerBL: {
    bottom: 22,
    left: 22,
    borderBottomWidth: 1.5,
    borderLeftWidth: 1.5,
  },
  cornerBR: {
    bottom: 22,
    right: 22,
    borderBottomWidth: 1.5,
    borderRightWidth: 1.5,
  },
  hint: {
    position: "absolute",
    top: 32,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  shutterRow: {
    paddingTop: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  shutterRing: {
    width: 78,
    height: 78,
    borderRadius: 39,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 4,
  },
  shutterCore: {
    flex: 1,
    borderRadius: 100,
  },

  // Step header (Edit / Context / Confirm)
  stepHeader: {
    paddingHorizontal: HORIZONTAL_GUTTER,
    paddingTop: 32,
    paddingBottom: 16,
  },

  // Edit step
  editScrollContent: {
    paddingHorizontal: HORIZONTAL_GUTTER,
    paddingTop: 8,
    paddingBottom: 16,
  },

  // Context step
  contextScrollContent: {
    paddingHorizontal: HORIZONTAL_GUTTER,
    paddingBottom: 16,
  },

  // Confirm step
  confirmScrollContent: {
    paddingHorizontal: HORIZONTAL_GUTTER,
    paddingBottom: 24,
  },
  confirmCard: {
    borderRadius: 14,
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderWidth: StyleSheet.hairlineWidth,
  },
  confirmDivider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 18,
  },
  confirmRows: {
    gap: 10,
  },
  confirmRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },

  // Footer
  footer: {
    paddingHorizontal: HORIZONTAL_GUTTER,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: StyleSheet.hairlineWidth,
  },

  // Field
  field: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 16,
    paddingVertical: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  fieldLabel: {
    width: 64,
  },
});
