import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

test('the chore dialog close control is a non-submitting button', () => {
  assert.match(html, /<button[^>]*id="close-chore-dialog"[^>]*type="button"[^>]*>/);
});

test('calendar view is available from the main navigation', () => {
  assert.match(html, /<a[^>]*href="#calendar"[^>]*>Calendar<\/a>/);
  assert.match(html, /<section[^>]*id="calendar"[^>]*>/);
  assert.match(html, /<div[^>]*id="calendar-grid"[^>]*>/);
});
