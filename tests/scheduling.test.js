import test from 'node:test';
import assert from 'node:assert/strict';
import { isDueOn, buildTodayList, getDefaultChores, getWeeklyStats } from '../src/scheduling.js';

const date = (value) => new Date(`${value}T12:00:00`);

test('default chores cover routine whole-home cleaning', () => {
  const chores = getDefaultChores();
  const names = new Set(chores.map((chore) => chore.name));

  [
    'Wash dishes',
    'Wipe kitchen counters',
    'Tidy the main living area',
    'Vacuum floors',
    'Mop hard floors',
    'Clean the toilet',
    'Clean the shower or tub',
    'Dust surfaces',
    'Change bed linens',
    'Wash a load of laundry',
    'Empty trash and recycling',
    'Clean the stovetop and microwave',
    'Clean mirrors',
    'Clear expired food from the fridge'
  ].forEach((name) => assert.equal(names.has(name), true, `missing default chore: ${name}`));

  assert.equal(chores.every((chore) => chore.room && chore.minutes > 0 && chore.frequency), true);
  assert.deepEqual(new Set(chores.map((chore) => chore.frequency)), new Set(['daily', 'weekly', 'biweekly']));
});

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

test('a newly added custom chore appears in an already full today list', async () => {
  const { createCustomChore } = await import('../src/scheduling.js');
  const today = date('2026-08-11');
  const chores = [
    { id: '1', name: 'Dishes', frequency: 'daily', startDate: '2026-08-03', priority: 5 },
    { id: '2', name: 'Counters', frequency: 'daily', startDate: '2026-08-03', priority: 4 }
  ];

  const custom = createCustomChore(
    { id: 'custom', name: 'Clean windows', frequency: 'daily', minutes: 15 },
    today,
    chores
  );

  assert.deepEqual(buildTodayList([...chores, custom], today, 2).map((chore) => chore.id), ['custom', '1']);
});

test('custom chore IDs work when randomUUID is unavailable', async () => {
  const { createChoreId } = await import('../src/scheduling.js');

  const id = createChoreId({});

  assert.match(id, /^chore-/);
});
