import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
export const cacheEntries = sqliteTable('cache_entries', {
  key: text('key').primaryKey(),
  payload: text('payload').notNull(),
  updatedAt: text('updated_at').notNull(),
});
export const snapshots = sqliteTable('snapshots', {
  day: text('day').primaryKey(),
  payload: text('payload').notNull(),
  createdAt: text('created_at').notNull(),
});

// Application append-only ledger; retained independently of refreshable caches.
export const forecastRecords = sqliteTable('forecast_records', {
  id: text('id').primaryKey(),
  payload: text('payload').notNull(),
  issuedAt: text('issued_at').notNull(),
  targetMonth: text('target_month').notNull(),
  modelVersion: text('model_version').notNull(),
});
