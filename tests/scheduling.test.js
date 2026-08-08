import test from 'node:test';
import assert from 'node:assert/strict';
import { isDueOn, buildTodayList, getWeeklyStats } from '../src/scheduling.js';

const date = (value) => new Date(`${value}T12:00:00`);

test('daily chores are due every day', () => {
  const chore = { id: 'dishes', frequency: 'daily', startDate: '2026-08-03' };
  assert.equal(isDueOn(chore, date('2026-08-11')), true);
});

test('weekly chores are due on their configured weekday', () => {
  const chore = { id: 'vacuum', frequency: 'weekly', weekday: 1, startDate: '2026-08-03' };
  assert.equal(isDueOn(chore, date('2026-08-10')), true);
  assert.equal(isDueOn(chore, date('2026-08-11')), false);
});

test('today list includes due chores and respects the daily limit', () => {
  const chores = [
    { id: '1', name: 'Dishes', frequency: 'daily', startDate: '2026-08-03', priority: 2 },
    { id: '2', name: 'Counters', frequency: 'daily', startDate: '2026-08-03', priority: 1 },
    { id: '3', name: 'Vacuum', frequency: 'weekly', weekday: 2, startDate: '2026-08-03', priority: 3 }
  ];
  assert.deepEqual(buildTodayList(chores, date('2026-08-11'), 2).map((item) => item.id), ['3', '1']);
});

test('weekly stats count completed chores in the last seven days', () => {
  const completions = [
    { choreId: '1', completedAt: '2026-08-11T08:00:00' },
    { choreId: '2', completedAt: '2026-08-08T08:00:00' },
    { choreId: '3', completedAt: '2026-08-01T08:00:00' }
  ];
  assert.deepEqual(getWeeklyStats(completions, date('2026-08-11')), { completed: 2, daysActive: 2 });
});
