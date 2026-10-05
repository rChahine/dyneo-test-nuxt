<script setup lang="ts">
import { computed } from 'vue';
import type { ToastKind } from '~/composables/useToast';

const props = defineProps<{ kind: ToastKind | null }>();

const TOASTS = {
  lost: {
    text: 'Connexion perdue',
    shell: 'border-level-error bg-level-error-bg',
    dot: 'animate-pulse bg-level-error',
  },
  restored: {
    text: 'Connexion rétablie',
    shell: 'border-accent bg-accent-bg',
    dot: 'bg-accent',
  },
  paused: {
    text: 'Flux mis en pause',
    shell: 'border-level-warning bg-level-warning-bg',
    dot: 'bg-level-warning',
  },
} as const;

const toast = computed(() => (props.kind ? TOASTS[props.kind] : null));
</script>

<template>
  <div
    class="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center p-5"
    role="status"
    aria-live="polite"
  >
    <Transition
      enter-active-class="transition duration-200"
      enter-from-class="translate-y-2 opacity-0"
      leave-active-class="transition duration-200"
      leave-to-class="translate-y-2 opacity-0"
    >
      <div
        v-if="toast"
        :key="toast.text"
        class="pointer-events-auto flex items-center gap-3 rounded-lg border px-4 py-3 text-sm text-ink shadow-lg"
        :class="toast.shell"
      >
        <span
          class="size-2 shrink-0 rounded-full"
          :class="toast.dot"
          aria-hidden="true"
        />
        <span>{{ toast.text }}</span>
      </div>
    </Transition>
  </div>
</template>
