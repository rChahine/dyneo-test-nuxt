import typia from 'typia';
import type { LogEntry } from '~/types/log';

const LogEntryParser = typia.json.createIsParse<LogEntry>();

export const parseLogEntry = (data: string): LogEntry | null => {
  try {
    return LogEntryParser(data);
  } catch {
    return null;
  }
};
