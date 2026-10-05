<script setup lang="ts">
import { computed } from 'vue';
import LogFilters from '~/components/logs/LogFilters.vue';
import LogSearch from '~/components/logs/LogSearch.vue';
import LogTable from '~/components/logs/LogTable.vue';
import LogsHeader from '~/components/logs/LogsHeader.vue';
import ConnectionToast from '~/components/ui/ConnectionToast.vue';
import { useLogFeed } from '~/composables/useLogFeed';
import { MAX_ENTRIES } from '~/constants/stream';

const { store, status, toast, togglePause, selectEntry } = useLogFeed();

const shownLabel = computed(() => `${store.visibleEntries.length} sur ${MAX_ENTRIES} entrées affichées`);
</script>

<template>
  <div class="flex h-screen flex-col overflow-hidden bg-surface font-sans text-sm text-ink">
    <LogsHeader
      :status="status"
      :paused="store.paused"
      :can-clear="store.hasEntries"
      :pending-count="store.heldCount"
      @toggle-pause="togglePause"
      @clear="store.reset"
    />

    <div class="flex min-h-0 grow">
      <LogFilters
        :active-levels="store.activeLevels"
        :counts="store.levelCounts"
        @toggle="store.toggleLevel"
      />

      <main class="flex min-h-0 min-w-0 grow flex-col gap-4 p-5">
        <LogSearch v-model="store.query" />

        <p class="m-0 shrink-0 text-[13px] text-muted">
          {{ shownLabel }}
        </p>

        <LogTable
          class="min-h-0 grow"
          :entries="store.visibleEntries"
          :selected-id="store.selectedId"
          @select="selectEntry"
          @close="store.clearSelection()"
        />
      </main>
    </div>

    <ConnectionToast :kind="toast" />
  </div>
</template>
