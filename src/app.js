import { buildTodayList, createCustomChore, getDefaultChores, getWeeklyStats } from './scheduling.js';

const STORAGE_KEY = 'good-enough-home-v1';
const today = new Date();
const isoDate = (date) => date.toISOString().slice(0, 10);
const defaultChores = getDefaultChores();

let state = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || { chores: defaultChores, completions: [], limit: 4 };
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
const completedToday = new Set(state.completions.filter((item) => item.completedAt.startsWith(isoDate(today))).map((item) => item.choreId));
const formatDate = today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });

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
  save(); renderToday(); renderReview();
}

function removeChore(chore) {
  state.chores = state.chores.filter((item) => item.id !== chore.id);
  save(); renderToday();
}

function renderReview() {
  const stats = getWeeklyStats(state.completions, today);
  document.querySelector('#week-completed').textContent = stats.completed;
  document.querySelector('#days-active').textContent = stats.daysActive;
}

document.querySelector('#add-chore').addEventListener('click', () => document.querySelector('#chore-dialog').showModal());
document.querySelector('#chore-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  state.chores.push(createCustomChore({
    id: crypto.randomUUID(),
    name: form.get('name'),
    minutes: form.get('minutes'),
    frequency: form.get('frequency')
  }, today, state.chores));
  save(); event.currentTarget.reset(); document.querySelector('#chore-dialog').close(); renderToday();
});
document.querySelector('#light-day').addEventListener('click', () => { state.limit = state.limit === 4 ? 3 : 4; save(); renderToday(); document.querySelector('#light-day').textContent = state.limit === 3 ? 'Return to full list' : 'Make it lighter'; });

function route() {
  const review = location.hash === '#review';
  document.querySelector('#today').classList.toggle('hidden', review);
  document.querySelector('#review').classList.toggle('hidden', !review);
  document.querySelectorAll('.nav-link').forEach((link) => link.classList.toggle('active', link.getAttribute('href') === (review ? '#review' : '#today')));
  if (review) renderReview();
}
window.addEventListener('hashchange', route);
renderToday(); renderReview(); route();
