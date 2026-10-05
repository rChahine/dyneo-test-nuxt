import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope } from 'vue';
import { TOAST_AUTO_CLEAR_DELAY, useToast } from '~/composables/useToast';

function mountToast() {
  const scope = effectScope();
  const toast = scope.run(() => useToast())!;
  return { ...toast, stop: () => scope.stop() };
}

describe('useToast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with nothing shown', () => {
    const { toast, stop } = mountToast();

    expect(toast.value).toBeNull();
    stop();
  });

  it('clears every kind on the shared delay', () => {
    const { toast, show, stop } = mountToast();

    for (const kind of ['lost', 'restored', 'paused'] as const) {
      show(kind);
      expect(toast.value).toBe(kind);
      vi.advanceTimersByTime(TOAST_AUTO_CLEAR_DELAY);
      expect(toast.value).toBeNull();
    }

    stop();
  });

  it('keeps a toast up until the delay is reached', () => {
    const { toast, show, stop } = mountToast();

    show('lost');
    vi.advanceTimersByTime(TOAST_AUTO_CLEAR_DELAY - 1);
    expect(toast.value).toBe('lost');

    vi.advanceTimersByTime(1);
    expect(toast.value).toBeNull();

    stop();
  });

  it('clears a toast before its delay', () => {
    const { toast, show, clear, stop } = mountToast();

    show('lost');
    clear('lost');
    expect(toast.value).toBeNull();

    stop();
  });

  it('shows lost over restored and restored over paused', () => {
    const { toast, show, clear, stop } = mountToast();

    show('paused');
    show('restored');
    show('lost');
    expect(toast.value).toBe('lost');

    clear('lost');
    expect(toast.value).toBe('restored');

    clear('restored');
    expect(toast.value).toBe('paused');

    stop();
  });

  it('restarts the delay when the same toast is shown again', () => {
    const { toast, show, stop } = mountToast();

    show('paused');
    vi.advanceTimersByTime(TOAST_AUTO_CLEAR_DELAY - 1);
    show('paused');
    vi.advanceTimersByTime(TOAST_AUTO_CLEAR_DELAY - 1);

    expect(toast.value).toBe('paused');
    stop();
  });

  it('clearAll drops every active toast', () => {
    const { toast, show, clearAll, stop } = mountToast();

    show('lost');
    show('restored');
    clearAll();
    expect(toast.value).toBeNull();

    stop();
  });
});
