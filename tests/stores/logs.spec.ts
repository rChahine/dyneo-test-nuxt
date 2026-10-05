import { createPinia, setActivePinia } from 'pinia';
import { beforeEach, describe, expect, it } from 'vitest';
import { MAX_ENTRIES } from '~/constants/stream';
import { useLogsStore } from '~/stores/logs';
import { makeEntry } from '../factories';

describe('logs store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('filtering', () => {
    it('keeps only the active levels', () => {
      const store = useLogsStore();
      store.ingest(makeEntry({ id: 'a', level: 'error' }));
      store.ingest(makeEntry({ id: 'b', level: 'debug' }));

      store.toggleLevel('debug');

      expect(store.visibleEntries.map((entry) => entry.id)).toEqual(['a']);
    });

    it('returns nothing when every level is off', () => {
      const store = useLogsStore();
      store.ingest(makeEntry({ level: 'info' }));

      for (const level of [...store.activeLevels]) {
        store.toggleLevel(level);
      }

      expect(store.activeLevels).toEqual([]);
      expect(store.visibleEntries).toEqual([]);
    });

    it('narrows the rows with the query', () => {
      const store = useLogsStore();
      store.ingest(makeEntry({ id: 'msg', message: 'Payment DECLINED' }));
      store.ingest(makeEntry({ id: 'svc', service: 'payment-service', message: 'ok' }));

      store.query = 'declined';

      expect(store.visibleEntries.map((entry) => entry.id)).toEqual(['msg']);
    });

    it('counts levels over the query matches, ignoring the level filter', () => {
      const store = useLogsStore();
      store.ingest(makeEntry({ level: 'error', message: 'boom in checkout' }));
      store.ingest(makeEntry({ level: 'error', message: 'unrelated' }));
      store.ingest(makeEntry({ level: 'info', message: 'checkout started' }));

      store.query = 'checkout';
      store.toggleLevel('error');

      expect(store.levelCounts.error).toBe(1);
      expect(store.levelCounts.info).toBe(1);
      expect(store.visibleEntries).toHaveLength(1);
    });
  });

  describe('ingest', () => {
    it('keeps entries newest first and drops duplicates by id', () => {
      const store = useLogsStore();
      store.ingest(makeEntry({ id: 'first' }));
      store.ingest(makeEntry({ id: 'second' }));
      store.ingest(makeEntry({ id: 'first' }));

      expect(store.visibleEntries.map((entry) => entry.id)).toEqual(['second', 'first']);
    });

    it('caps the buffer at MAX_ENTRIES', () => {
      const store = useLogsStore();
      for (let i = 0; i < MAX_ENTRIES + 25; i += 1) {
        store.ingest(makeEntry({ id: `e${i}` }));
      }

      expect(store.visibleEntries).toHaveLength(MAX_ENTRIES);
      expect(store.visibleEntries[0]!.id).toBe(`e${MAX_ENTRIES + 24}`);
    });
  });

  describe('pause buffering', () => {
    it('buffers incoming entries instead of showing them', () => {
      const store = useLogsStore();
      store.ingest(makeEntry({ id: 'live' }));
      store.pause();

      store.ingest(makeEntry({ id: 'buffered' }));

      expect(store.visibleEntries.map((entry) => entry.id)).toEqual(['live']);
      expect(store.heldCount).toBe(1);
    });

    it('flushes the buffer in front of the visible entries on resume', () => {
      const store = useLogsStore();
      store.ingest(makeEntry({ id: 'live' }));
      store.pause();
      store.ingest(makeEntry({ id: 'older' }));
      store.ingest(makeEntry({ id: 'newer' }));

      store.resume();

      expect(store.visibleEntries.map((entry) => entry.id)).toEqual(['newer', 'older', 'live']);
      expect(store.heldCount).toBe(0);
    });

    it('still drops duplicates of already visible entries', () => {
      const store = useLogsStore();
      store.ingest(makeEntry({ id: 'live' }));
      store.pause();

      store.ingest(makeEntry({ id: 'live' }));

      expect(store.heldCount).toBe(0);

      store.resume();
      expect(store.visibleEntries.map((entry) => entry.id)).toEqual(['live']);
    });

    it('caps the buffer at MAX_ENTRIES, keeping the newest', () => {
      const store = useLogsStore();
      store.pause();
      for (let i = 0; i < MAX_ENTRIES + 25; i += 1) {
        store.ingest(makeEntry({ id: `e${i}` }));
      }

      expect(store.heldCount).toBe(MAX_ENTRIES);

      store.resume();
      expect(store.visibleEntries).toHaveLength(MAX_ENTRIES);
      expect(store.visibleEntries[0]!.id).toBe(`e${MAX_ENTRIES + 24}`);
    });

    it('drops the buffer on clear so a resume brings nothing back', () => {
      const store = useLogsStore();
      store.pause();
      store.ingest(makeEntry({ id: 'buffered' }));

      store.reset();
      expect(store.heldCount).toBe(0);

      store.resume();
      expect(store.visibleEntries).toEqual([]);
    });
  });

  describe('selection', () => {
    it('toggles off when the same row is picked twice', () => {
      const store = useLogsStore();
      store.ingest(makeEntry({ id: 'a' }));

      store.toggleSelection('a');
      expect(store.selectedEntry?.id).toBe('a');

      store.toggleSelection('a');
      expect(store.selectedEntry).toBeNull();
    });

    it('reports no selection once the entry is filtered out', () => {
      const store = useLogsStore();
      store.ingest(makeEntry({ id: 'a', level: 'debug' }));
      store.toggleSelection('a');

      store.toggleLevel('debug');

      expect(store.selectedEntry).toBeNull();
    });

    it('clears the selection and the buffer on clear', () => {
      const store = useLogsStore();
      store.ingest(makeEntry({ id: 'a' }));
      store.toggleSelection('a');

      store.reset();

      expect(store.visibleEntries).toEqual([]);
      expect(store.selectedId).toBeNull();
    });
  });
});
