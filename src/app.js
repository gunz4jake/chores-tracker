import { buildCalendarMonth, buildTodayList, createChoreId, createCustomChore, getDefaultChores, getWeeklyStats } from './scheduling.js';

const STORAGE_KEY = 'good-enough-home-v1';
const today = new Date();
const isoDate = (date) => date.toISOString().slice(0, 10);
const defaultChores = getDefaultChores();

let state = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || { chores: defaultChores, completions: [], limit: 4 };
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const completedToday = new Set(state.completions.filter((item) => item.completedAt.startsWith(isoDate(today))).map((item) => item.choreId));
const formatDate = today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
let calendarMonth = new Date(today.getFullYear(), today.getMonth(), 1, 12);

document.querySelector('#date-label').textContent = formatDate;

function renderToday() {
  const list = buildTodayList(state.chores, today, state.limit);
  const container = document.querySelector('#chore-list');
  container.replaceChildren();
  list.forEach((chore) => {
    const done = completedToday.has(chore.id);
    const row = document.createElement('article');
    row.className = `chore${done ? ' done' : ''}`;
    row.innerHTML = `<button class="check" aria-label="${done ? 'Mark incomplete' : 'Complete'} ${chore.name}">${done ? '✓' : ''}</button><div class="chore-copy"><span class="chore-name">${chore.name}</span><span class="chore-meta">${chore.room || 'Home'} · ${chore.minutes || 10} min</span></div><button class="remove" aria-label="Remove ${chore.name}">×</button>`;
    row.querySelector('.check').addEventListener('click', () => toggleCompletion(chore));
    row.querySelector('.remove').addEventListener('click', () => removeChore(chore));
    container.append(row);
  });
  const count = [...completedToday].filter((id) => list.some((chore) => chore.id === id)).length;
  document.querySelector('#progress-count').textContent = `${count} of ${list.length}`;
  document.querySelector('#progress-bar').style.width = `${list.length ? count / list.length * 100 : 0}%`;
}

function toggleCompletion(chore) {
  const index = state.completions.findIndex((item) => item.choreId === chore.id && item.completedAt.startsWith(isoDate(today)));
  if (index >= 0) { state.completions.splice(index, 1); completedToday.delete(chore.id); }
  else { state.completions.push({ choreId: chore.id, completedAt: new Date().toISOString() }); completedToday.add(chore.id); }
  save(); renderToday(); renderReview(); renderCalendar();
}

function removeChore(chore) {
  state.chores = state.chores.filter((item) => item.id !== chore.id);
  save(); renderToday(); renderCalendar();
}

function renderReview() {
  const stats = getWeeklyStats(state.completions, today);
  document.querySelector('#week-completed').textContent = stats.completed;
  document.querySelector('#days-active').textContent = stats.daysActive;
}

function renderCalendar() {
  const days = buildCalendarMonth(state.chores, calendarMonth);
  const grid = document.querySelector('#calendar-grid');
  document.querySelector('#calendar-month').textContent = calendarMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  grid.replaceChildren();

  days.forEach((day, index) => {
    const cell = document.createElement('article');
    cell.className = `calendar-day${day.dateKey === isoDate(today) ? ' is-today' : ''}`;
    cell.setAttribute('aria-label', day.date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }));
    if (index === 0) cell.style.gridColumnStart = day.date.getDay() + 1;

    const number = document.createElement('time');
    number.dateTime = day.dateKey;
    number.className = 'calendar-day-number';
    number.textContent = day.date.getDate();
    cell.append(number);

    const completed = new Set(state.completions.filter((item) => item.completedAt.startsWith(day.dateKey)).map((item) => item.choreId));
    day.chores.slice(0, 4).forEach((chore) => {
      const item = document.createElement('span');
      item.className = `calendar-chore${completed.has(chore.id) ? ' is-complete' : ''}`;
      item.textContent = chore.name;
      item.title = `${chore.name} · ${chore.minutes || 10} min`;
      cell.append(item);
    });

    if (day.chores.length > 4) {
      const more = document.createElement('span');
      more.className = 'calendar-more';
      more.textContent = `+${day.chores.length - 4} more`;
      cell.append(more);
    }
    grid.append(cell);
  });
}

document.querySelector('#add-chore').addEventListener('click', () => document.querySelector('#chore-dialog').showModal());
document.querySelector('#close-chore-dialog').addEventListener('click', () => document.querySelector('#chore-dialog').close());
document.querySelector('#chore-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  state.chores.push(createCustomChore({
    id: createChoreId(),
    name: form.get('name'),
    minutes: form.get('minutes'),
    frequency: form.get('frequency')
  }, today, state.chores));
  save(); event.currentTarget.reset(); document.querySelector('#chore-dialog').close(); renderToday(); renderCalendar();
});
document.querySelector('#light-day').addEventListener('click', () => { state.limit = state.limit === 4 ? 3 : 4; save(); renderToday(); document.querySelector('#light-day').textContent = state.limit === 3 ? 'Return to full list' : 'Make it lighter'; });
document.querySelector('#previous-month').addEventListener('click', () => { calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1, 12); renderCalendar(); });
document.querySelector('#next-month').addEventListener('click', () => { calendarMonth = new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1, 12); renderCalendar(); });
document.querySelector('#current-month').addEventListener('click', () => { calendarMonth = new Date(today.getFullYear(), today.getMonth(), 1, 12); renderCalendar(); });

function route() {
  const requestedPage = location.hash.slice(1);
  const page = ['calendar', 'review'].includes(requestedPage) ? requestedPage : 'today';
  document.querySelectorAll('.page-section').forEach((section) => section.classList.toggle('hidden', section.id !== page));
  document.querySelectorAll('.nav-link').forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${page}`));
  if (page === 'review') renderReview();
  if (page === 'calendar') renderCalendar();
}
window.addEventListener('hashchange', route);
renderToday(); renderReview(); renderCalendar(); route();
