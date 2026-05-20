import type { Quote } from '@ponder/db/schema';
import { apiClient } from './client';

type ApiResponse<T> = { data: T };

// Schema's $inferInsert marks defaulted columns (id, createdAt) optional,
// but they're always present in SELECT responses — narrow them here so
// callers don't have to guard.
type WireQuote = Quote & { id: string; createdAt: Date | string };

export function getQuotes() {
  return apiClient
    .get('quotes')
    .json<ApiResponse<Array<WireQuote & { themes: string[] }>>>()
    .then((res) => res.data);
}

export function getTodaysQuote() {
  return apiClient
    .get('quotes/today')
    .json<
      ApiResponse<Pick<WireQuote, 'id' | 'text' | 'bookTitle' | 'authorName'>>
    >()
    .then((res) => res.data);
}

export function getQuoteById(id: string) {
  return apiClient
    .get(`quotes/${id}`)
    .json<
      ApiResponse<
        WireQuote & {
          themes: string[];
          journalEntries: Array<{
            id: string;
            preview: string;
            createdAt: string;
          }>;
        }
      >
    >()
    .then((res) => res.data);
}
