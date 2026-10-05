import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { effectScope } from 'vue';
import { useLogStream } from '~/composables/useLogStream';
import { RECONNECT_DELAY_MS, STREAM_URL, TAIL_SIZE } from '~/constants/stream';
import { FakeEventSource, stubEventSource } from '../helpers/fakeEventSource';

function mountStream(onPayload: (raw: string) => void = () => {}) {
  const scope = effectScope();
  const stream = scope.run(() => useLogStream(onPayload))!;
  return { ...stream, stop: () => scope.stop() };
}

describe('useLogStream', () => {
  beforeEach(() => {
    stubEventSource();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('requests the configured tail and tracks the connection status', () => {
    const payloads: string[] = [];
    const stream = mountStream((raw) => payloads.push(raw));

    stream.connect();
    const source = FakeEventSource.current();

    expect(source.url).toBe(`${STREAM_URL}?tail=${TAIL_SIZE}`);
    expect(stream.status.value).toBe('connecting');

    source.onopen!();
    expect(stream.status.value).toBe('open');

    source.onmessage!({ data: 'raw payload' });
    expect(payloads).toEqual(['raw payload']);

    stream.stop();
  });

  it('reports the loss and reopens the stream after the retry delay', () => {
    const stream = mountStream();
    stream.connect();
    const first = FakeEventSource.current();

    first.onerror!();

    expect(stream.status.value).toBe('error');
    expect(stream.lost.value).toBe(true);
    expect(first.close).toHaveBeenCalledOnce();

    vi.advanceTimersByTime(RECONNECT_DELAY_MS);
    const second = FakeEventSource.current();
    expect(second).not.toBe(first);
    expect(stream.lost.value).toBe(true);

    second.onopen!();
    expect(stream.status.value).toBe('open');
    expect(stream.lost.value).toBe(false);

    stream.stop();
  });

  it('keeps retrying while the stream stays down', () => {
    const stream = mountStream();
    stream.connect();

    const seen = new Set([FakeEventSource.current()]);
    for (let i = 0; i < 3; i += 1) {
      FakeEventSource.current().onerror!();
      vi.advanceTimersByTime(RECONNECT_DELAY_MS);
      expect(seen.has(FakeEventSource.current())).toBe(false);
      seen.add(FakeEventSource.current());
    }

    expect(stream.lost.value).toBe(true);
    stream.stop();
  });

  it('cancels a pending retry on disconnect', () => {
    const stream = mountStream();
    stream.connect();
    const first = FakeEventSource.current();
    first.onerror!();

    stream.disconnect();
    vi.advanceTimersByTime(RECONNECT_DELAY_MS * 5);

    expect(FakeEventSource.current()).toBe(first);
    expect(stream.status.value).toBe('idle');
    expect(stream.lost.value).toBe(false);

    stream.stop();
  });

  it('opens a single stream and closes it on disconnect', () => {
    const stream = mountStream();
    stream.connect();
    const source = FakeEventSource.current();
    stream.connect();

    expect(FakeEventSource.current()).toBe(source);

    stream.disconnect();
    expect(source.close).toHaveBeenCalledOnce();
    expect(stream.status.value).toBe('idle');

    stream.stop();
  });

  it('closes the stream when the owning scope is disposed', () => {
    const stream = mountStream();
    stream.connect();
    const source = FakeEventSource.current();

    stream.stop();

    expect(source.close).toHaveBeenCalledOnce();
  });
});
