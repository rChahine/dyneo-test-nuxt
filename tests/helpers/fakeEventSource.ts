import { vi } from 'vitest';

export class FakeEventSource {
  static last: FakeEventSource | null = null;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onerror: (() => void) | null = null;
  close = vi.fn();

  constructor(public url: string) {
    FakeEventSource.last = this;
  }

  static reset() {
    FakeEventSource.last = null;
  }

  static current() {
    if (!FakeEventSource.last) {
      throw new Error('no EventSource was opened');
    }
    return FakeEventSource.last;
  }
}

export function stubEventSource() {
  FakeEventSource.reset();
  vi.stubGlobal('EventSource', FakeEventSource);
}
