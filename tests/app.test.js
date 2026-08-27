import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('the chore dialog close control is a non-submitting button', () => {
  assert.match(html, /<button[^>]*id="close-chore-dialog"[^>]*type="button"[^>]*>/);
});
