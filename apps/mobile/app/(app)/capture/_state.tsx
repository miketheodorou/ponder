import { zodResolver } from '@hookform/resolvers/zod';
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

interface CaptureDraftContextValue {
  form: UseFormReturn<CreateQuoteInput>;
  /** True if the user tapped the shutter at step 0; false if they tapped Skip. */
  photoTaken: boolean;
  setPhotoTaken: (taken: boolean) => void;
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

  return (
    <CaptureDraftContext.Provider value={{ form, photoTaken, setPhotoTaken }}>
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
