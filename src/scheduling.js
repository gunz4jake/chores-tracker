const DAY = 24 * 60 * 60 * 1000;

export function getDefaultChores() {
  return [
    { id: 'dishes', name: 'Wash dishes', room: 'Kitchen', minutes: 10, frequency: 'daily', startDate: '2026-01-01', priority: 5 },
    { id: 'counters', name: 'Wipe kitchen counters', room: 'Kitchen', minutes: 5, frequency: 'daily', startDate: '2026-01-01', priority: 4 },
    { id: 'living-area', name: 'Tidy the main living area', room: 'Living room', minutes: 10, frequency: 'daily', startDate: '2026-01-01', priority: 2 },
    { id: 'kitchen-sweep', name: 'Sweep the kitchen floor', room: 'Kitchen', minutes: 5, frequency: 'daily', startDate: '2026-01-01', priority: 2 },
    { id: 'vacuum', name: 'Vacuum floors', room: 'Home', minutes: 20, frequency: 'weekly', weekday: 1, startDate: '2026-01-01', priority: 4 },
    { id: 'toilet', name: 'Clean the toilet', room: 'Bathroom', minutes: 10, frequency: 'weekly', weekday: 2, startDate: '2026-01-01', priority: 4 },
    { id: 'bathroom-sink', name: 'Clean the bathroom sink', room: 'Bathroom', minutes: 5, frequency: 'weekly', weekday: 2, startDate: '2026-01-01', priority: 3 },
    { id: 'shower', name: 'Clean the shower or tub', room: 'Bathroom', minutes: 15, frequency: 'weekly', weekday: 3, startDate: '2026-01-01', priority: 3 },
    { id: 'dust', name: 'Dust surfaces', room: 'Home', minutes: 15, frequency: 'weekly', weekday: 3, startDate: '2026-01-01', priority: 3 },
    { id: 'mop', name: 'Mop hard floors', room: 'Home', minutes: 20, frequency: 'weekly', weekday: 4, startDate: '2026-01-01', priority: 4 },
    { id: 'bed-linens', name: 'Change bed linens', room: 'Bedroom', minutes: 10, frequency: 'weekly', weekday: 5, startDate: '2026-01-01', priority: 3 },
    { id: 'laundry', name: 'Wash a load of laundry', room: 'Laundry', minutes: 10, frequency: 'weekly', weekday: 6, startDate: '2026-01-01', priority: 3 },
    { id: 'kitchen-appliances', name: 'Clean the stovetop and microwave', room: 'Kitchen', minutes: 15, frequency: 'weekly', weekday: 6, startDate: '2026-01-01', priority: 3 },
    { id: 'trash', name: 'Empty trash and recycling', room: 'Home', minutes: 10, frequency: 'weekly', weekday: 0, startDate: '2026-01-01', priority: 5 },
    { id: 'mirrors', name: 'Clean mirrors', room: 'Bathroom', minutes: 10, frequency: 'biweekly', weekday: 2, startDate: '2026-01-01', priority: 2 },
    { id: 'fridge', name: 'Clear expired food from the fridge', room: 'Kitchen', minutes: 10, frequency: 'biweekly', weekday: 0, startDate: '2026-01-01', priority: 4 }
  ];
}

function startOfDay(value) {
  const result = new Date(value);
  result.setHours(0, 0, 0, 0);
  return result;
}

export function isDueOn(chore, value) {
  const day = startOfDay(value);
  const start = startOfDay(chore.startDate || day);
  if (day < start) return false;
  if (chore.frequency === 'daily') return true;
  if (chore.frequency === 'weekly') return day.getDay() === Number(chore.weekday ?? start.getDay());
  if (chore.frequency === 'biweekly') {
    return day.getDay() === Number(chore.weekday ?? start.getDay()) &&
      Math.floor((day - start) / (7 * DAY)) % 2 === 0;
  }
  return false;
}

export function buildTodayList(chores, date = new Date(), limit = 4) {
  return chores
    .filter((chore) => chore.active !== false && isDueOn(chore, date))
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0) || a.name.localeCompare(b.name))
    .slice(0, limit);
}

export function getWeeklyStats(completions, date = new Date()) {
  const end = startOfDay(date).getTime() + DAY;
  const start = end - 7 * DAY;
  const recent = completions.filter((item) => {
    const timestamp = new Date(item.completedAt).getTime();
    return timestamp >= start && timestamp < end;
  });
  return {
    completed: recent.length,
    daysActive: new Set(recent.map((item) => startOfDay(item.completedAt).toISOString())).size
  };
}
