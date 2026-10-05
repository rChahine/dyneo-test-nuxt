export const LOG_LEVELS = ['debug', 'info', 'warning', 'error', 'critical'] as const;

export type LogLevel = (typeof LOG_LEVELS)[number];

export type LogMetadata = Record<string, string | number | boolean | null>;

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  duration_ms: number;
  metadata: LogMetadata;
}
