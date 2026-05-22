// Mock data — placeholder for the future API. Shapes here will likely
// converge on whatever the server returns; treat as throwaway until then.

export interface Quote {
  id: string;
  text: string;
  author: string;
  book: string;
  page: number;
  /** Human-readable saved date, as it should be rendered in the UI. */
  date: string;
  tags: string[];
  /** Linked journal entry IDs, in chronological order. */
  entries: string[];
}

export interface JournalEntry {
  id: string;
  quoteId: string;
  date: string;
  body: string;
}

export interface FilterChip {
  id: string;
  label: string;
}

export const QUOTES: Quote[] = [
  {
    id: "q1",
    text: "He who has a why to live can bear almost any how.",
    author: "Nietzsche",
    book: "Twilight of the Idols",
    page: 6,
    date: "Mar 14, 2026",
    tags: ["meaning", "suffering"],
    entries: ["j1", "j2"],
  },
  {
    id: "q2",
    text: "In the depth of winter, I finally learned that within me there lay an invincible summer.",
    author: "Camus",
    book: "Return to Tipasa",
    page: 144,
    date: "Mar 9, 2026",
    tags: ["resilience"],
    entries: ["j3"],
  },
  {
    id: "q3",
    text: "You have power over your mind — not outside events. Realize this, and you will find strength.",
    author: "Marcus Aurelius",
    book: "Meditations",
    page: 89,
    date: "Feb 28, 2026",
    tags: ["stoicism", "agency"],
    entries: [],
  },
  {
    id: "q4",
    text: "Anxiety is the dizziness of freedom.",
    author: "Kierkegaard",
    book: "The Concept of Anxiety",
    page: 61,
    date: "Feb 19, 2026",
    tags: ["anxiety", "freedom"],
    entries: ["j4"],
  },
  {
    id: "q5",
    text: "We suffer more in imagination than in reality.",
    author: "Seneca",
    book: "Letters from a Stoic",
    page: 23,
    date: "Feb 11, 2026",
    tags: ["stoicism"],
    entries: [],
  },
  {
    id: "q6",
    text: "The unexamined life is not worth living.",
    author: "Plato",
    book: "Apology",
    page: 38,
    date: "Jan 30, 2026",
    tags: ["examination"],
    entries: [],
  },
  {
    id: "q7",
    text: "Between stimulus and response there is a space. In that space is our power to choose our response.",
    author: "Frankl",
    book: "Man's Search for Meaning",
    page: 104,
    date: "Jan 18, 2026",
    tags: ["meaning", "agency"],
    entries: ["j5"],
  },
  {
    id: "q8",
    text: "One must imagine Sisyphus happy.",
    author: "Camus",
    book: "The Myth of Sisyphus",
    page: 123,
    date: "Jan 6, 2026",
    tags: ["meaning", "absurd"],
    entries: [],
  },
];

export const ENTRIES: Record<string, JournalEntry> = {
  j1: {
    id: "j1",
    quoteId: "q1",
    date: "March 14, 2026",
    body: `Re-read this on the train this morning. The "why" Nietzsche names isn't a slogan — it isn't even a clearly stated reason. It's something more like a posture toward life, a tilt of the body.\n\nWhen I have one, I notice the small irritations of the day fall away. When I don't, every minor friction becomes the whole problem. So maybe the practice isn't to find the why and hold it, but to keep returning to it. Knowing it will slip.`,
  },
  j2: {
    id: "j2",
    quoteId: "q1",
    date: "March 16, 2026",
    body: `Talked to M. about this over coffee. She pushed back: doesn't this risk romanticizing suffering? If you have a why, the how doesn't matter — but plenty of "hows" really do matter, and shouldn't be borne quietly.\n\nFair point. I think the line lives in the word "almost."`,
  },
  j3: {
    id: "j3",
    quoteId: "q2",
    date: "March 9, 2026",
    body: `Camus in three lines does what most self-help books fail to do in three hundred pages. The image of an invincible summer hidden in winter is exactly the right shape for what I want to remember.`,
  },
  j4: {
    id: "j4",
    quoteId: "q4",
    date: "February 22, 2026",
    body: `Sat with this one for a long time today. The "dizziness" reframes anxiety not as a problem to be eliminated but as a sensation that comes with the territory of being able to choose.\n\nDoesn't make it pleasant. But it does make it less suspicious of itself.`,
  },
  j5: {
    id: "j5",
    quoteId: "q7",
    date: "January 19, 2026",
    body: `The space is where the work happens. Not the stimulus, not the response — the silence between them. Most of my failures are failures to find the space.`,
  },
};

export const FILTER_CHIPS: FilterChip[] = [
  { id: "all", label: "All" },
  { id: "recent", label: "Recent" },
  { id: "meaning", label: "meaning" },
  { id: "stoicism", label: "stoicism" },
  { id: "anxiety", label: "anxiety" },
  { id: "agency", label: "agency" },
  { id: "resilience", label: "resilience" },
  { id: "absurd", label: "absurd" },
];
