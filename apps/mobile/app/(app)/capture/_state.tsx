import { zodResolver } from '@hookform/resolvers/zod';
import type { Block } from '@infinitered/react-native-mlkit-text-recognition';
import {
  createQuoteSchema,
  type CreateQuoteInput
} from '@ponder/db/validators';
import { createContext, type ReactNode, useContext, useState } from 'react';
import { type UseFormReturn, useForm } from 'react-hook-form';

// Single react-hook-form instance shared across the four wizard steps
// (camera → edit → context → confirm), plus a `photoTaken` flag captured at
// step 0 so step 1 can swap its copy ("Trim" vs "Enter") for the manual entry
// path. Lives in a Context owned by the capture layout so state persists as
// screens push/pop and resets every time the modal closes (the Provider
// unmounts on close).

/** The photo + OCR result captured at the camera step, consumed by `select`. */
export interface CaptureShot {
  uri: string;
  blocks: Block[];
}

interface CaptureDraftContextValue {
  form: UseFormReturn<CreateQuoteInput>;
  /** True if the user tapped the shutter at step 0; false if they tapped Skip. */
  photoTaken: boolean;
  setPhotoTaken: (taken: boolean) => void;
  /** Camera shot + recognized blocks; null on the Skip (manual) path. */
  shot: CaptureShot | null;
  setShot: (shot: CaptureShot | null) => void;
}

const CaptureDraftContext = createContext<CaptureDraftContextValue | null>(null);

export function CaptureDraftProvider({ children }: { children: ReactNode }) {
  const form = useForm<CreateQuoteInput>({
    resolver: zodResolver(createQuoteSchema),
    mode: 'onChange',
    defaultValues: {
      // All fields start empty. The prototype pre-fills book/author from the
      // user's last capture; we'll wire that when that feature lands.
      text: '',
      bookTitle: '',
      authorName: '',
      pageNumber: null
    }
  });
  const [photoTaken, setPhotoTaken] = useState(false);
  const [shot, setShot] = useState<CaptureShot | null>(null);

  return (
    <CaptureDraftContext.Provider
      value={{ form, photoTaken, setPhotoTaken, shot, setShot }}
    >
      {children}
    </CaptureDraftContext.Provider>
  );
}

export function useCaptureDraft(): CaptureDraftContextValue {
  const ctx = useContext(CaptureDraftContext);
  if (!ctx) {
    throw new Error(
      'useCaptureDraft must be used inside CaptureDraftProvider'
    );
  }
  return ctx;
}
