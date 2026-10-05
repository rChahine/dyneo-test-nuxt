import { LOG_LEVELS, type LogEntry, type LogLevel } from '~/types/log';

function normalizeQuery(query: string): string {
  return query.trim().toLowerCase();
}

export function matchesQuery(entry: LogEntry, needle: string): boolean {
  if (!needle) {
    return true;
  }
  const haystack = [entry.message, entry.service, ...Object.values(entry.metadata).map(String)]
    .join(' ')
    .toLowerCase();
  return haystack.includes(needle);
}

export function searchEntries(entries: LogEntry[], query: string): LogEntry[] {
  const needle = normalizeQuery(query);
  return entries.filter((entry) => matchesQuery(entry, needle));
}

export function filterByLevels(entries: LogEntry[], levels: LogLevel[]): LogEntry[] {
  return entries.filter((entry) => levels.includes(entry.level));
}

export function countByLevel(entries: LogEntry[]): Record<LogLevel, number> {
  const counts = Object.fromEntries(LOG_LEVELS.map((level) => [level, 0])) as Record<
    LogLevel,
    number
  >;
  for (const entry of entries) {
    counts[entry.level] += 1;
  }
  return counts;
}
