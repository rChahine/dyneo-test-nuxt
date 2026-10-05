<script setup lang="ts">
import { computed } from 'vue';
import type { LogEntry } from '~/types/log';
import { formatTime } from '~/utils/formatTime';
import { levelBadgeClass } from '~/utils/levelStyles';

const props = defineProps<{ entry: LogEntry }>();

const emit = defineEmits<{ close: [] }>();

const fields = computed(() => [
  { key: 'id', value: String(props.entry.id) },
  { key: 'timestamp', value: props.entry.timestamp },
  { key: 'duration_ms', value: String(props.entry.duration_ms) },
  ...Object.entries(props.entry.metadata).map(([key, value]) => ({ key, value: String(value) })),
]);
</script>

<template>
  <section
    aria-label="Détail de l'entrée"
    class="flex flex-col gap-3.5 rounded-[10px] border border-accent bg-raised px-5 py-4"
  >
    <div class="flex items-center gap-3">
      <span
        class="rounded px-2 py-0.5 font-mono text-xs font-medium"
        :class="levelBadgeClass(entry.level)"
      >{{ entry.level }}</span>
      <span class="font-mono text-[13px] text-muted">{{ formatTime(entry.timestamp) }} · {{ entry.service }}</span>
      <div class="grow" />
      <button
        type="button"
        aria-label="Fermer le détail"
        class="min-h-11 rounded-lg border border-edge bg-surface px-4 text-sm text-ink"
        @click="emit('close')"
      >
        Fermer
      </button>
    </div>
    <p class="whitespace-pre-wrap font-mono text-sm leading-relaxed">
      {{ entry.message }}
    </p>
    <div class="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-2.5">
      <div
        v-for="field in fields"
        :key="field.key"
        data-testid="detail-field"
        class="rounded-lg border border-edge bg-surface px-3 py-2.5"
      >
        <div class="text-xs text-muted">
          {{ field.key }}
        </div>
        <div class="mt-0.5 break-words font-mono text-[13px]">
          {{ field.value }}
        </div>
      </div>
    </div>
  </section>
</template>
