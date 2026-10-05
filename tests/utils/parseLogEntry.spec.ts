import { describe, expect, it } from 'vitest';
import { parseLogEntry } from '~/utils/parseLogEntry';
import { makeEntry } from '../factories';

describe('parseLogEntry', () => {
  it('parses a well-formed payload', () => {
    const entry = makeEntry({ id: 'ok', level: 'critical' });

    expect(parseLogEntry(JSON.stringify(entry))).toEqual(entry);
  });

  it('rejects invalid JSON', () => {
    expect(parseLogEntry('not json')).toBeNull();
    expect(parseLogEntry('{"id":')).toBeNull();
  });

  it.each([
    ['an unknown level', { level: 'fatal' }],
    ['a missing service', { service: undefined }],
    ['a numeric message', { message: 42 }],
    ['metadata of the wrong shape', { metadata: { nested: { deep: true } } }],
  ])('rejects a payload with %s', (_label, override) => {
    const payload = { ...makeEntry(), ...override };

    expect(parseLogEntry(JSON.stringify(payload))).toBeNull();
  });
});
