import { onScopeDispose, ref } from 'vue';
import { RECONNECT_DELAY_MS, TAIL_SIZE } from '~/constants/stream';

export type ConnectionStatus = 'idle' | 'connecting' | 'open' | 'error';

export function useLogStream(callback: (raw: string) => void) {
  const status = ref<ConnectionStatus>('idle');
  const lost = ref(false);
  const config = useRuntimeConfig();

  let source: EventSource | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;

  const connect = (): void => {
    if (source) {
      return;
    }
    status.value = 'connecting';
    source = new EventSource(`${config.public.LOGS_HOST}/logs/stream?tail=${TAIL_SIZE}`);
    source.onopen = () => {
      status.value = 'open';
      lost.value = false;
    };
    source.onmessage = (event: MessageEvent<string>) => callback(event.data);
    source.onerror = () => handleFailure();
  };

  const disconnect = (): void => {
    cancelRetry();
    source?.close();
    source = null;
    status.value = 'idle';
    lost.value = false;
  };

  const cancelRetry = (): void => {
    if (!retryTimer) {
      return;
    }
    clearTimeout(retryTimer);
    retryTimer = null;
  };

  const scheduleRetry = (): void => {
    if (retryTimer) {
      return;
    }
    retryTimer = setTimeout(() => {
      retryTimer = null;
      connect();
    }, RECONNECT_DELAY_MS);
  };

  const handleFailure = (): void => {
    source?.close();
    source = null;
    status.value = 'error';
    lost.value = true;
    scheduleRetry();
  };

  onScopeDispose(disconnect);

  return { status, lost, connect, disconnect };
}
