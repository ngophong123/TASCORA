import { expect, it } from 'vitest';
import { parseTrustProxy } from '../../apps/api/src/lib/trust-proxy';

it.each([
  ['1', 1], ['2', 2], ['0', 0], ['true', true], ['false', false],
  [' 1 ', 1], [' true\t', true], [' false ', false], ['', false], ['   ', false], [undefined, false],
])('parses TRUST_PROXY %s into the typed setting %s', (value, expected) => {
  expect(parseTrustProxy(value as string | undefined)).toBe(expected);
});
it.each(['yes', 'TRUE', '-1', '+1', '1.0', '1e0', '01', 'Infinity', 'NaN', '9007199254740992', 'loopback', '127.0.0.1', '1,2'])('rejects invalid or ambiguous TRUST_PROXY without echoing its value: %s', value => {
  expect(() => parseTrustProxy(value)).toThrow('TRUST_PROXY must be true, false, or a non-negative safe integer hop count');
});
