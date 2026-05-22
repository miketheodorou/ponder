import { z } from 'zod';

export const updateQuoteSchema = z.object({
  text: z.string().min(1).optional(),
  bookTitle: z.string().min(1).optional(),
  authorName: z.string().min(1).optional(),
  pageNumber: z.number().int().nullable().optional()
});

export const updateJournalEntrySchema = z.object({
  content: z.string().min(1).optional()
});

export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
export type UpdateJournalEntryInput = z.infer<typeof updateJournalEntrySchema>;
