import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { LOG_LEVELS, type LogEntry, type LogLevel } from '~/types/log';
import { createLogBuffer } from '~/utils/logBuffer';
import { countByLevel, filterByLevels, searchEntries } from '~/utils/logFilters';

export const useLogsStore = defineStore('logs', () => {
  const buffer = createLogBuffer();
  const activeLevels = ref<LogLevel[]>([...LOG_LEVELS]);
  const query = ref('');
  const selectedId = ref<string | null>(null);
  const paused = ref(false);

  const queryMatches = computed(() => searchEntries(buffer.live.value, query.value));
  const visibleEntries = computed(() => filterByLevels(queryMatches.value, activeLevels.value));
  const levelCounts = computed(() => countByLevel(queryMatches.value));
  const heldCount = computed(() => buffer.buffered.value.length);
  const hasEntries = computed(() => buffer.live.value.length > 0);
  const selectedEntry = computed(
    () => visibleEntries.value.find((entry) => entry.id === selectedId.value) ?? null,
  );

  const ingest = (entry: LogEntry): void => {
    buffer.add(entry, { hold: paused.value });
  };

  const toggleLevel = (level: LogLevel): void => {
    activeLevels.value = activeLevels.value.includes(level)
      ? activeLevels.value.filter((it) => it !== level)
      : [...activeLevels.value, level];
  };

  const toggleSelection = (id: string): void => {
    selectedId.value = selectedId.value === id ? null : id;
  };

  const clearSelection = (): void => {
    selectedId.value = null;
  };

  const pause = (): void => {
    paused.value = true;
  };

  const resume = (): void => {
    paused.value = false;
    buffer.flush();
  };

  const reset = (): void => {
    buffer.clear();
    clearSelection();
  };

  return {
    activeLevels,
    query,
    selectedId,
    paused,
    visibleEntries,
    levelCounts,
    heldCount,
    hasEntries,
    selectedEntry,
    ingest,
    toggleLevel,
    toggleSelection,
    clearSelection,
    pause,
    resume,
    reset,
  };
});
