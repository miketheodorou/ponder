import type { JournalEntry } from '@ponder/db/schema';
import { apiClient } from './client';

type ApiResponse<T> = { data: T };

// $inferInsert marks defaulted columns optional; narrow them since the
// wire format always has them.
type WireJournalEntry = JournalEntry & {
  id: string;
  createdAt: Date | string;
};

export function getJournalEntryById(id: string) {
  return apiClient
    .get(`journal-entries/${id}`)
    .json<ApiResponse<WireJournalEntry>>()
    .then((res) => res.data);
}
