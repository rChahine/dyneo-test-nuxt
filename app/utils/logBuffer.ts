import { ref, type Ref } from 'vue';
import { MAX_ENTRIES } from '~/constants/stream';
import type { LogEntry } from '~/types/log';

export function createLogBuffer() {
  const live = ref<LogEntry[]>([]);
  const buffered = ref<LogEntry[]>([]);
  const seenIds = new Set<string>();

  const dropOverflow = (entries: Ref<LogEntry[]>): void => {
    if (entries.value.length <= MAX_ENTRIES) {
      return;
    }
    for (const dropped of entries.value.splice(MAX_ENTRIES)) {
      seenIds.delete(dropped.id);
    }
  };

  const add = (entry: LogEntry, { hold }: { hold: boolean }): void => {
    if (seenIds.has(entry.id)) {
      return;
    }
    seenIds.add(entry.id);

    const target = hold ? buffered : live;
    target.value.unshift(entry);
    dropOverflow(target);
  };

  const flush = (): void => {
    if (buffered.value.length === 0) {
      return;
    }
    live.value = [...buffered.value, ...live.value];
    buffered.value = [];
    dropOverflow(live);
  };

  const clear = (): void => {
    live.value = [];
    buffered.value = [];
    seenIds.clear();
  };

  return { live, buffered, add, flush, clear };
}
