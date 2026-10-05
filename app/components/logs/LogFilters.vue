<script setup lang="ts">
import { LOG_LEVELS, type LogLevel } from '~/types/log';
import { levelBorderClass, levelDotClass } from '~/utils/levelStyles';

defineProps<{
  activeLevels: LogLevel[];
  counts: Record<LogLevel, number>;
}>();

const emit = defineEmits<{ toggle: [level: LogLevel] }>();
</script>

<template>
  <aside class="flex w-44 shrink-0 flex-col gap-2 overflow-y-auto border-r border-edge p-5 sm:w-60">
    <div class="text-xs uppercase tracking-widest text-muted">
      Niveau
    </div>
    <button
      v-for="level in LOG_LEVELS"
      :key="level"
      type="button"
      :aria-pressed="activeLevels.includes(level)"
      :data-testid="`level-${level}`"
      class="flex min-h-11 items-center gap-2.5 rounded-lg border px-3 text-left text-sm text-ink"
      :class="
        activeLevels.includes(level)
          ? [levelBorderClass(level), 'bg-edge-soft']
          : ['border-edge', 'bg-panel']
      "
      @click="emit('toggle', level)"
    >
      <span
        class="size-2.5 rounded-sm"
        :class="levelDotClass(level)"
      />
      <span class="grow font-mono text-[13px]">{{ level }}</span>
      <span class="text-[13px] text-muted">{{ counts[level] }}</span>
    </button>
  </aside>
</template>
