import { expect, test } from 'bun:test';
import { sanitizePath } from './sanitize-path';
import { sep } from 'node:path';

test('sanitize path', () => {
  expect(sanitizePath(`<<foobar>>${sep}hiihaa`)).toBe(`foobar${sep}hiihaa`);
  expect(sanitizePath(`foo${sep}hiihaa.bar`)).toBe(`foo${sep}hiihaa.bar`);
});
