import type { LogEntry, LogLevel } from '~/types/log';

let counter = 0;

export function makeEntry(overrides: Partial<LogEntry> = {}): LogEntry {
  counter += 1;
  return {
    id: `entry-${counter}`,
    timestamp: '2026-10-02T07:19:08.824102Z',
    level: 'info' as LogLevel,
    service: 'user-service',
    message: 'Request handled',
    duration_ms: 42,
    metadata: { request_id: 'abc123', user_id: 7, http_status: 200 },
    ...overrides,
  };
}
