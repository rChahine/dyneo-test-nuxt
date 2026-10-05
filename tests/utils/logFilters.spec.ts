import { describe, expect, it } from 'vitest';
import { countByLevel, filterByLevels, matchesQuery, searchEntries } from '~/utils/logFilters';
import { makeEntry } from '../factories';

describe('matchesQuery', () => {
  const entry = makeEntry({
    message: 'Payment DECLINED',
    service: 'payment-service',
    metadata: { request_id: 'ff00aa' },
  });

  it('keeps every entry when the needle is empty', () => {
    expect(matchesQuery(entry, '')).toBe(true);
  });

  it('matches message, service and metadata values', () => {
    expect(matchesQuery(entry, 'declined')).toBe(true);
    expect(matchesQuery(entry, 'payment-service')).toBe(true);
    expect(matchesQuery(entry, 'ff00aa')).toBe(true);
    expect(matchesQuery(entry, 'checkout')).toBe(false);
  });
});

describe('searchEntries', () => {
  it('trims and lowercases the query before matching', () => {
    const entries = [makeEntry({ id: 'hit', message: 'Order created' }), makeEntry({ id: 'miss' })];

    expect(searchEntries(entries, '  ORDER ').map((entry) => entry.id)).toEqual(['hit']);
  });
});

describe('filterByLevels', () => {
  it('keeps only the listed levels', () => {
    const entries = [
      makeEntry({ id: 'a', level: 'error' }),
      makeEntry({ id: 'b', level: 'debug' }),
    ];

    expect(filterByLevels(entries, ['error']).map((entry) => entry.id)).toEqual(['a']);
    expect(filterByLevels(entries, [])).toEqual([]);
  });
});

describe('countByLevel', () => {
  it('counts each level and reports zero for the missing ones', () => {
    const entries = [
      makeEntry({ level: 'error' }),
      makeEntry({ level: 'error' }),
      makeEntry({ level: 'info' }),
    ];

    expect(countByLevel(entries)).toEqual({
      debug: 0,
      info: 1,
      warning: 0,
      error: 2,
      critical: 0,
    });
  });
});
