import { z } from 'zod';

export const createQuoteSchema = z.object({
  text: z.string().min(1),
  bookTitle: z.string().min(1),
  authorName: z.string().min(1),
  pageNumber: z.number().int().nullable().optional()
});

export const updateQuoteSchema = z.object({
  text: z.string().min(1).optional(),
  bookTitle: z.string().min(1).optional(),
  authorName: z.string().min(1).optional(),
  pageNumber: z.number().int().nullable().optional()
});

export const createJournalEntrySchema = z.object({
  content: z.string().min(1)
});

export const updateJournalEntrySchema = z.object({
  content: z.string().min(1).optional()
});

export type CreateQuoteInput = z.infer<typeof createQuoteSchema>;
export type UpdateQuoteInput = z.infer<typeof updateQuoteSchema>;
export type CreateJournalEntryInput = z.infer<typeof createJournalEntrySchema>;
export type UpdateJournalEntryInput = z.infer<typeof updateJournalEntrySchema>;
