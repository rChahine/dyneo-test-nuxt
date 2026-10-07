import { getCurrentInstance, onBeforeUnmount, onMounted, watch } from 'vue';
import { useLogStream } from '~/composables/useLogStream';
import { useToast } from '~/composables/useToast';
import { useLogsStore } from '~/stores/logs';
import { parseLogEntry } from '~/utils/parseLogEntry';

export function useLogFeed() {
  const store = useLogsStore();
  const toastService = useToast();

  const stream = useLogStream((raw) => {
    const entry = parseLogEntry(raw);
    if (entry) {
      store.ingest(entry);
    } else {
      console.error(`log could not be parsed: ${JSON.stringify(raw)}`);
    }
  });

  watch(stream.lost, (lost: boolean, wasLost: boolean) => {
    if (lost) {
      toastService.show('lost');
      return;
    }
    if (wasLost) {
      toastService.clear('lost');
      toastService.show('restored');
    }
  });

  const pause = (): void => {
    store.pause();
    toastService.show('paused');
  };

  const resume = (): void => {
    store.resume();
    toastService.clear('paused');
  };

  const togglePause = (): void => {
    if (store.paused) {
      resume();
    } else {
      pause();
    }
  };

  const selectEntry = (id: string): void => {
    const opening = store.selectedId !== id;
    store.toggleSelection(id);
    if (opening) {
      pause();
    }
  };

  if (getCurrentInstance()) {
    onMounted(stream.connect);
    onBeforeUnmount(() => {
      stream.disconnect();
      toastService.clearAll();
    });
  }

  return {
    store,
    status: stream.status,
    toast: toastService.toast,
    connect: stream.connect,
    disconnect: stream.disconnect,
    togglePause,
    selectEntry,
  };
}
