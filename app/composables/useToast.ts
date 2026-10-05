import { computed, onScopeDispose, ref } from 'vue';

export type ToastKind = 'lost' | 'restored' | 'paused';

export const TOAST_AUTO_CLEAR_DELAY = 4000;

const PRIORITY: ToastKind[] = ['lost', 'restored', 'paused'];

export function useToast() {
  const active = ref<Record<ToastKind, boolean>>({ lost: false, restored: false, paused: false });
  const timers = new Map<ToastKind, ReturnType<typeof setTimeout>>();

  const toast = computed<ToastKind | null>(
    () => PRIORITY.find((kind) => active.value[kind]) ?? null,
  );

  const stopTimer = (kind: ToastKind): void => {
    const timer = timers.get(kind);
    if (!timer) {
      return;
    }
    clearTimeout(timer);
    timers.delete(kind);
  };

  const clear = (kind: ToastKind): void => {
    stopTimer(kind);
    active.value[kind] = false;
  };

  const show = (kind: ToastKind): void => {
    stopTimer(kind);
    active.value[kind] = true;
    timers.set(
      kind,
      setTimeout(() => clear(kind), TOAST_AUTO_CLEAR_DELAY),
    );
  };

  const clearAll = (): void => {
    for (const kind of PRIORITY) {
      clear(kind);
    }
  };

  onScopeDispose(clearAll);

  return { toast, show, clear, clearAll };
}
