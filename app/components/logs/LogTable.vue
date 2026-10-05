<script setup lang="ts">
import { ref, useTemplateRef, watch } from 'vue';
import LogDetail from '~/components/logs/LogDetail.vue';
import type { LogEntry } from '~/types/log';
import { formatTime } from '~/utils/formatTime';
import { levelBadgeClass } from '~/utils/levelStyles';

const props = defineProps<{
  entries: LogEntry[];
  selectedId: string | null;
}>();

const emit = defineEmits<{ select: [id: string]; close: [] }>();

const COLUMNS = 'grid-cols-[104px_84px_160px_minmax(0,1fr)]';

// Le navigateur ancre le scroll (`overflow-anchor`) dès qu'on n'est pas tout en haut : les entrées
// insérées au-dessus décalent `scrollTop` d'autant, et la vue paraît figée. On préserve ce
// comportement — il garde la ligne en cours de lecture en place — et on signale les entrées
// arrivées entre-temps.
const AT_TOP_THRESHOLD_PX = 8;

const scroller = useTemplateRef<HTMLElement>('scroller');
const atTop = ref(true);
const seenTopId = ref<string | null>(null);
const unseenCount = ref(0);

const markSeen = (): void => {
  seenTopId.value = props.entries[0]?.id ?? null;
  unseenCount.value = 0;
};

const onScroll = (): void => {
  atTop.value = (scroller.value?.scrollTop ?? 0) <= AT_TOP_THRESHOLD_PX;
  if (atTop.value) {
    markSeen();
  }
};

// Saut instantané : une animation `smooth` se fait rattraper par l'ancrage, qui repousse
// `scrollTop` à chaque entrée insérée pendant l'animation — on n'arrive jamais en haut.
const scrollToTop = (): void => {
  if (scroller.value) {
    scroller.value.scrollTop = 0;
  }
  atTop.value = true;
  markSeen();
};

watch(
  () => props.entries,
  (entries) => {
    if (atTop.value) {
      markSeen();
      return;
    }
    // Repère absent : les filtres ont changé, pas le flux. On repart de zéro plutôt que de
    // compter toute la liste comme nouvelle.
    const unseen = entries.findIndex((entry) => entry.id === seenTopId.value);
    if (unseen === -1) {
      markSeen();
      return;
    }
    unseenCount.value = unseen;
  },
  { immediate: true },
);
</script>

<template>
  <section
    aria-label="Entrées de log"
    class="flex min-h-0 flex-col overflow-hidden rounded-[10px] border border-edge bg-panel"
  >
    <div
      class="grid shrink-0 gap-3 border-b border-edge bg-raised px-4 py-2.5 text-xs uppercase tracking-widest text-muted"
      :class="COLUMNS"
    >
      <span>Heure</span><span>Niveau</span><span>Service</span><span>Message</span>
    </div>
    <div class="relative flex min-h-0 grow flex-col">
      <div
        ref="scroller"
        class="min-h-0 grow overflow-y-auto"
        @scroll.passive="onScroll"
      >
        <template
          v-for="entry in entries"
          :key="entry.id"
        >
          <button
            type="button"
            data-testid="log-row"
            :aria-pressed="entry.id === selectedId"
            :aria-expanded="entry.id === selectedId"
            class="grid min-h-11 w-full items-center gap-3 border-0 border-b border-edge-soft px-4 py-1 text-left font-mono text-[13px] text-ink"
            :class="[COLUMNS, entry.id === selectedId ? 'bg-edge-soft' : 'bg-transparent']"
            @click="emit('select', entry.id)"
          >
            <span class="text-muted">{{ formatTime(entry.timestamp) }}</span>
            <span
              class="justify-self-start rounded px-2 py-0.5 text-xs font-medium"
              :class="levelBadgeClass(entry.level)"
            >{{ entry.level }}</span>
            <span class="truncate text-ink-soft">{{ entry.service }}</span>
            <span class="truncate">{{ entry.message }}</span>
          </button>
          <LogDetail
            v-if="entry.id === selectedId"
            :entry="entry"
            class="m-2.5"
            @close="emit('close')"
          />
        </template>
        <p
          v-if="entries.length === 0"
          class="px-4 py-10 text-center text-muted"
        >
          Aucune entrée ne correspond à ces filtres.
        </p>
      </div>
      <button
        v-if="unseenCount > 0"
        type="button"
        data-testid="unseen-jump"
        class="absolute inset-x-0 top-2.5 mx-auto flex min-h-11 w-fit items-center gap-2 rounded-full border border-accent bg-accent-bg px-4 text-sm text-ink shadow-lg"
        @click="scrollToTop"
      >
        <span aria-hidden="true">↑</span>
        <span>{{ unseenCount }} nouvelles entrées</span>
      </button>
    </div>
  </section>
</template>
