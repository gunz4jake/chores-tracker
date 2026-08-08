const DAY = 24 * 60 * 60 * 1000;

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
