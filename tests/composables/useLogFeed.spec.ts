import { createPinia, setActivePinia } from 'pinia';
import { mockNuxtImport } from '@nuxt/test-utils/runtime';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope, nextTick } from 'vue';
import { useLogFeed } from '~/composables/useLogFeed';
import { TOAST_AUTO_CLEAR_DELAY } from '~/composables/useToast';
import { RECONNECT_DELAY_MS } from '~/constants/stream';
import { makeEntry } from '../factories';
import { FakeEventSource, stubEventSource } from '../helpers/fakeEventSource';

const LOGS_HOST = 'https://logs.test';
mockNuxtImport('useRuntimeConfig', () => () => ({ public: { LOGS_HOST } }));

function mountFeed() {
  const scope = effectScope();
  const feed = scope.run(() => useLogFeed())!;
  return { ...feed, stop: () => scope.stop() };
}

describe('useLogFeed', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    stubEventSource();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('ingests parsed payloads and ignores malformed ones', () => {
    const feed = mountFeed();
    feed.connect();
    const source = FakeEventSource.current();

    source.onmessage!({ data: JSON.stringify(makeEntry({ id: 'streamed' })) });
    expect(() => source.onmessage!({ data: 'not json' })).not.toThrow();
    expect(() => source.onmessage!({ data: '{"id":"x","level":"nope"}' })).not.toThrow();

    expect(feed.store.visibleEntries.map((entry) => entry.id)).toEqual(['streamed']);
    feed.stop();
  });

  it('pauses the feed and flashes a toast when an entry is opened', () => {
    const feed = mountFeed();
    feed.store.ingest(makeEntry({ id: 'a' }));

    feed.selectEntry('a');

    expect(feed.store.paused).toBe(true);
    expect(feed.toast.value).toBe('paused');

    vi.advanceTimersByTime(TOAST_AUTO_CLEAR_DELAY);
    expect(feed.toast.value).toBeNull();
    expect(feed.store.paused).toBe(true);

    feed.stop();
  });

  it('buffers streamed entries while an entry is open and flushes them on resume', () => {
    const feed = mountFeed();
    feed.connect();
    feed.store.ingest(makeEntry({ id: 'read' }));

    feed.selectEntry('read');
    FakeEventSource.current().onmessage!({ data: JSON.stringify(makeEntry({ id: 'buffered' })) });

    expect(feed.store.visibleEntries.map((entry) => entry.id)).toEqual(['read']);
    expect(feed.store.heldCount).toBe(1);

    feed.togglePause();

    expect(feed.store.visibleEntries.map((entry) => entry.id)).toEqual(['buffered', 'read']);
    expect(feed.store.heldCount).toBe(0);

    feed.stop();
  });

  it('leaves the feed paused when the entry is closed again', () => {
    const feed = mountFeed();
    feed.store.ingest(makeEntry({ id: 'a' }));

    feed.selectEntry('a');
    feed.selectEntry('a');

    expect(feed.store.selectedEntry).toBeNull();
    expect(feed.store.paused).toBe(true);

    feed.stop();
  });

  it('resumes the feed and drops the toast on toggle', () => {
    const feed = mountFeed();

    feed.togglePause();
    expect(feed.store.paused).toBe(true);
    expect(feed.toast.value).toBe('paused');

    feed.togglePause();
    expect(feed.store.paused).toBe(false);
    expect(feed.toast.value).toBeNull();

    feed.stop();
  });

  it('announces the loss and then the recovery', async () => {
    const feed = mountFeed();
    feed.connect();

    FakeEventSource.current().onerror!();
    await nextTick();
    expect(feed.toast.value).toBe('lost');

    vi.advanceTimersByTime(RECONNECT_DELAY_MS);
    FakeEventSource.current().onopen!();
    await nextTick();
    expect(feed.toast.value).toBe('restored');

    vi.advanceTimersByTime(TOAST_AUTO_CLEAR_DELAY);
    expect(feed.toast.value).toBeNull();

    feed.stop();
  });

  it('stays silent on a first connection that never dropped', async () => {
    const feed = mountFeed();
    feed.connect();

    FakeEventSource.current().onopen!();
    await nextTick();

    expect(feed.toast.value).toBeNull();
    feed.stop();
  });
});
