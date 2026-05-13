import { createContext, type ReactNode, useContext, useState } from 'react';

// Draft state for the in-flight capture, shared across the four wizard steps
// (camera → edit → context → confirm). Lives in a Context owned by the
// capture layout so it resets every time the modal closes and reopens.
// Will be replaced by a real mutation pipeline once the data layer lands.

interface CaptureDraftState {
  text: string;
  setText: (text: string) => void;
  book: string;
  setBook: (book: string) => void;
  author: string;
  setAuthor: (author: string) => void;
  page: string;
  setPage: (page: string) => void;
}

const CaptureDraftContext = createContext<CaptureDraftState | null>(null);

export function CaptureDraftProvider({ children }: { children: ReactNode }) {
  // Defaults mirror the prototype's "pre-filled from your last capture" copy
  // on the context step — those values render even before the user types.
  const [text, setText] = useState('');
  const [book, setBook] = useState('Twilight of the Idols');
  const [author, setAuthor] = useState('Nietzsche');
  const [page, setPage] = useState('');

  return (
    <CaptureDraftContext.Provider
      value={{
        text,
        setText,
        book,
        setBook,
        author,
        setAuthor,
        page,
        setPage
      }}
    >
      {children}
    </CaptureDraftContext.Provider>
  );
}

export function useCaptureDraft(): CaptureDraftState {
  const ctx = useContext(CaptureDraftContext);
  if (!ctx) {
    throw new Error(
      'useCaptureDraft must be used inside CaptureDraftProvider'
    );
  }
  return ctx;
}
