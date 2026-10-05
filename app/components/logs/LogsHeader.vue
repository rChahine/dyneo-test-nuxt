<script setup lang="ts">
import { computed } from 'vue';
import type { ConnectionStatus } from '~/composables/useLogStream';

const props = defineProps<{
  status: ConnectionStatus;
  paused: boolean;
  canClear: boolean;
  pendingCount: number;
}>();

const emit = defineEmits<{ 'toggle-pause': []; 'clear': [] }>();

const STATUS_LABELS = {
  idle: 'Déconnecté',
  connecting: 'Connexion…',
  open: 'Connecté',
  error: 'Reconnexion…',
} as const;

const statusLabel = computed(() => STATUS_LABELS[props.status]);
const liveLabel = computed(() => (props.paused ? 'En pause' : 'En direct'));
const liveDotClass = computed(() => (props.paused ? 'bg-muted' : 'bg-accent'));
</script>

<template>
  <header
    class="flex shrink-0 flex-wrap items-center gap-4 border-b border-edge bg-panel px-6 py-3.5"
  >
    <h1 class="m-0 text-base font-semibold tracking-wide">
      Dashboard
    </h1>
    <span class="text-[13px] text-muted">
      {{ statusLabel }} · flux technical-exercise.dyneo.io
    </span>
    <span
      v-if="paused && pendingCount > 0"
      class="rounded-full border border-level-warning bg-level-warning-bg px-2.5 py-1 text-[13px] text-ink"
      role="status"
      aria-live="polite"
    >
      {{ pendingCount }} en attente
    </span>
    <div class="grow" />
    <button
      type="button"
      class="min-h-11 rounded-lg border border-edge bg-raised px-4 text-sm text-ink disabled:opacity-40"
      :disabled="!canClear"
      @click="emit('clear')"
    >
      Vider
    </button>
    <button
      type="button"
      :aria-pressed="!paused"
      class="flex min-h-11 items-center gap-2 rounded-lg border border-edge bg-raised px-4 text-sm text-ink"
      @click="emit('toggle-pause')"
    >
      <span
        class="size-2 rounded-full"
        :class="liveDotClass"
      />
      <span>{{ liveLabel }}</span>
    </button>
  </header>
</template>
