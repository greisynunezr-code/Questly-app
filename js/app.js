/* ============================================================
   Questly — app logic
   ADHD-friendly daily quests + points, streaks, levels, rewards.
   All data lives locally in this browser (localStorage). No server.
   ============================================================ */

const LS_KEY = 'questly.v1';

/* ---------------- static config ---------------- */
const CATEGORIES = [
  { id: 'homework', label: 'Homework', icon: 'book' },
  { id: 'work',     label: 'Work',     icon: 'briefcase' },
  { id: 'chores',   label: 'Chores',   icon: 'broom' },
  { id: 'health',   label: 'Health',   icon: 'dumbbell' },
  { id: 'routine',  label: 'Routine',  icon: 'moon' },
  { id: 'other',    label: 'Other',    icon: 'star' },
];
const TASK_EMOJIS = (window.KAWAII_TASKS || ['book']);
const REWARD_EMOJIS = (window.KAWAII_REWARDS || ['game']);
// render a kawaii icon by key; falls back to showing an emoji char for old saves
function iconHTML(key) {
  if (key && window.KAWAII && window.KAWAII[key]) return `<span class="kico">${window.KAWAII[key]}</span>`;
  return key ? `<span class="kico">${esc(key)}</span>` : '';
}
const WEEKDAY_SHORT = ['S','M','T','W','T','F','S'];        // JS getDay 0..6
const WEEKDAY_FULL  = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const LEVEL_TITLES = [
  'Getting started','Warming up','Finding rhythm','On track','Focused',
  'Momentum','Consistent','Dedicated','Champion','Master','Legend','Mythic'
];

/* pet mascot evolves as you level up */
const PET_STAGES = [
  { min: 1, emoji: '🥚' }, { min: 3, emoji: '🐣' }, { min: 5, emoji: '🐤' },
  { min: 8, emoji: '🐥' }, { min: 11, emoji: '🐦' }, { min: 15, emoji: '🦉' },
];
function petEmoji(level) { let e = '🥚'; for (const s of PET_STAGES) if (level >= s.min) e = s.emoji; return e; }

/* encouragement */
const AFFIRMATIONS = [
  "You've got this — one quest at a time.",
  "Starting is the hardest part, and you're here.",
  "Small steps still move you forward.",
  "Progress, not perfection. 💛",
  "Future you will be so glad you did this.",
  "Done is better than perfect.",
  "You don't have to feel ready to begin.",
  "Every quest you finish is a real win.",
  "Be proud of showing up today.",
  "Your effort counts — even the tiny bits.",
  "One thing. Just pick one thing.",
  "You're building something great, slowly.",
  "Rest is allowed. So is trying again.",
  "That brain of yours is doing its best. 🌱",
  "Momentum loves a first step.",
  "You are more than your to-do list.",
];
const START_LINES = [
  "Let's just start — 5 minutes counts.",
  "Ready? I'll be right here with you.",
  "Deep breath. You and me. Let's go. 🚀",
  "You don't have to finish, just begin.",
];
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

const BADGES = [
  { id: 'first',    emoji: '🎉', name: 'First Quest',   desc: 'Finish 1 quest',        test: d => d.totalDone >= 1 },
  { id: 'ten',      emoji: '✅', name: 'Getting Going', desc: 'Finish 10 quests',      test: d => d.totalDone >= 10 },
  { id: 'fifty',    emoji: '💪', name: 'Grinder',       desc: 'Finish 50 quests',      test: d => d.totalDone >= 50 },
  { id: 'streak3',  emoji: '🔥', name: 'On a Roll',     desc: '3-day streak',          test: d => d.streak >= 3 },
  { id: 'streak7',  emoji: '⚡', name: 'Week Warrior',  desc: '7-day streak',          test: d => d.streak >= 7 },
  { id: 'streak30', emoji: '🌟', name: 'Unstoppable',   desc: '30-day streak',         test: d => d.streak >= 30 },
  { id: 'p100',     emoji: '💰', name: 'Century',       desc: 'Earn 100 points',       test: d => d.totalEarned >= 100 },
  { id: 'p1000',    emoji: '💎', name: 'Treasure',      desc: 'Earn 1,000 points',     test: d => d.totalEarned >= 1000 },
  { id: 'lvl5',     emoji: '🚀', name: 'Rising Star',   desc: 'Reach level 5',         test: d => d.level >= 5 },
  { id: 'lvl10',    emoji: '👑', name: 'Royalty',       desc: 'Reach level 10',        test: d => d.level >= 10 },
  { id: 'perfect',  emoji: '✨', name: 'Perfect Day',   desc: 'Finish all of today',   test: d => d.perfectToday },
  { id: 'weekgoal', emoji: '🏆', name: 'Goal Crusher',  desc: 'Hit a weekly goal',     test: d => d.weekPts >= d.weekGoal && d.weekGoal > 0 },
  { id: 'redeem',   emoji: '🎁', name: 'Treat Yourself',desc: 'Redeem a reward',       test: d => d.redeemedCount >= 1 },
  { id: 'earlybird',emoji: '🌅', name: 'Early Bird',    desc: 'Finish a quest before 9am', test: d => d.earlyBird },
];

/* ---------------- state ---------------- */
function defaultState() {
  return {
    version: 2,
    onboarded: false,
    profile: {
      name: '', weeklyGoal: 300, theme: 'auto', sound: true, notify: false, createdAt: Date.now(),
      mascot: { name: 'Sprout' }, winSound: 'chime', affirmations: true,
      transitionAlerts: true, focusDefaultMin: 25, switchBufferMin: 2, autoCompleteOnSteps: true,
    },
    tasks: [],
    completions: {},   // { 'YYYY-MM-DD': [ {taskId,title,emoji,points,ts} ] }
    rewards: [],
    redemptions: [],   // [ {id,rewardId,title,emoji,cost,dateKey,ts} ]
    badges: {},        // { badgeId: dateKey }
    brainDump: [],     // [ {id,text,ts} ]
    dayProgress: {},   // { 'YYYY-MM-DD': { taskId: { subDone:[subId,...] } } }
  };
}
let state = load();
let sw = null;
let reminderTimers = [];

function load() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return defaultState();
    const s = Object.assign(defaultState(), JSON.parse(raw));
    // migrate: deep-merge profile so new fields exist for old saves
    s.profile = Object.assign(defaultState().profile, s.profile || {});
    if (!s.profile.mascot) s.profile.mascot = { name: 'Sprout' };
    s.brainDump = s.brainDump || [];
    s.dayProgress = s.dayProgress || {};
    (s.tasks || []).forEach(t => { if (!t.subtasks) t.subtasks = []; if (t.durationMin === undefined) t.durationMin = null; if (!t.dayTimes) t.dayTimes = {}; });
    return s;
  } catch (e) { return defaultState(); }
}
function save() { try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) {} }

/* ---------------- date helpers ---------------- */
function keyOf(d) {
  const y = d.getFullYear(), m = String(d.getMonth() + 1).padStart(2, '0'), day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function todayKey() { return keyOf(new Date()); }
function weekDates() {
  // Monday..Sunday of the current week
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const dow = (now.getDay() + 6) % 7; // 0 = Monday
  const mon = new Date(now); mon.setDate(now.getDate() - dow);
  return Array.from({ length: 7 }, (_, i) => { const d = new Date(mon); d.setDate(mon.getDate() + i); return d; });
}

/* ---------------- gamification math ---------------- */
function levelFromXp(xp) {
  let level = 1, need = 100, floor = 0;
  while (xp >= floor + need) { floor += need; level++; need = Math.round((need * 1.32) / 10) * 10; }
  return { level, into: xp - floor, need, floor };
}
function computeStreak() {
  const has = k => (state.completions[k] && state.completions[k].length > 0);
  let d = new Date(); d.setHours(0, 0, 0, 0);
  if (!has(keyOf(d))) { d.setDate(d.getDate() - 1); if (!has(keyOf(d))) return 0; }
  let n = 0;
  while (has(keyOf(d))) { n++; d.setDate(d.getDate() - 1); }
  return n;
}
function longestStreak() {
  const days = Object.keys(state.completions).filter(k => state.completions[k] && state.completions[k].length).sort();
  let best = 0, run = 0, prev = null;
  for (const k of days) {
    const cur = new Date(k + 'T00:00:00');
    if (prev && (cur - prev) === 86400000) run++; else run = 1;
    best = Math.max(best, run); prev = cur;
  }
  return best;
}

/* recurrence */
function isDueOn(task, dateKey) {
  if (!task.active) return false;
  const d = new Date(dateKey + 'T00:00:00');
  const dow = d.getDay();
  switch (task.recur.type) {
    case 'daily':    return true;
    case 'weekdays': return dow >= 1 && dow <= 5;
    case 'weekends': return dow === 0 || dow === 6;
    case 'custom':   return (task.recur.days || []).includes(dow);
    case 'once':     return task.recur.date === dateKey;
    case 'monthly':  return d.getDate() === monthDay(task.recur, d);
    case 'quarterly': return d.getMonth() % 3 === 0 && d.getDate() === monthDay(task.recur, d);
    default:         return false;
  }
}
// day of month a monthly/quarterly task lands on (clamped so "31st" still happens in short months)
function monthDay(recur, d) {
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return Math.min(recur.dom || 1, last);
}
function ordinal(n) { const s = ['th', 'st', 'nd', 'rd'], v = n % 100; return n + (s[(v - 20) % 10] || s[v] || s[0]); }
function todaysTasks() { const k = todayKey(); return state.tasks.filter(t => isDueOn(t, k)); }
function isCompleted(taskId, k = todayKey()) { return (state.completions[k] || []).some(c => c.taskId === taskId); }
// effective start/reminder time for a task on a given date (per-day override, else default)
function taskTimeOn(task, dateKey = todayKey()) {
  const dow = new Date(dateKey + 'T00:00:00').getDay();
  const dt = task.dayTimes || {};
  if (Object.prototype.hasOwnProperty.call(dt, dow)) return dt[dow] || '';
  return task.reminder || '';
}

/* one object with everything the UI needs */
function derive() {
  let totalEarned = 0, totalDone = 0, earlyBird = false;
  for (const k in state.completions) {
    for (const c of state.completions[k]) {
      totalEarned += c.points; totalDone++;
      if (c.ts && new Date(c.ts).getHours() < 9) earlyBird = true;
    }
  }
  const spent = state.redemptions.reduce((s, r) => s + r.cost, 0);
  const balance = totalEarned - spent;
  const lvl = levelFromXp(totalEarned);
  const wdates = weekDates();
  const weekKeys = wdates.map(keyOf);
  const weekPts = weekKeys.reduce((s, k) => s + (state.completions[k] || []).reduce((a, c) => a + c.points, 0), 0);
  const due = todaysTasks();
  const doneToday = due.filter(t => isCompleted(t.id)).length;
  const perfectToday = due.length > 0 && doneToday === due.length;
  return {
    totalEarned, totalDone, balance, spent, earlyBird,
    level: lvl.level, xpInto: lvl.into, xpNeed: lvl.need,
    streak: computeStreak(), best: longestStreak(),
    weekPts, weekGoal: state.profile.weeklyGoal || 0, weekKeys, wdates,
    dueCount: due.length, doneToday, perfectToday,
    redeemedCount: state.redemptions.length,
  };
}

/* ---------------- DOM helpers ---------------- */
const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
function el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function catOf(id) { return CATEGORIES.find(c => c.id === id) || CATEGORIES[CATEGORIES.length - 1]; }

/* ---------------- theme ---------------- */
function resolvedTheme() {
  const t = state.profile.theme;
  if (t === 'light' || t === 'dark') return t;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function applyTheme() {
  document.documentElement.setAttribute('data-theme', resolvedTheme());
  const meta = document.querySelector('meta[name="theme-color"]');
}
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { if (state.profile.theme === 'auto') applyTheme(); });

/* ---------------- rendering ---------------- */
let currentView = 'today';
let animateToday = true;   // only stagger-animate the list when the view is (re)entered
function renderAll() { renderTopbar(); renderMascot(); renderToday(); renderTasks(); renderRewards(); renderYou(); }

function renderMascot() {
  const m = $('#mascot'); if (!m) return;
  const d = derive();
  m.hidden = false;
  $('#mascotName').textContent = (state.profile.mascot && state.profile.mascot.name) || 'Buddy';
  const h = new Date().getHours();
  const aff = state.profile.affirmations;
  let mood = '🙂', cls = '', expr = 'normal', msg;
  if (d.dueCount > 0 && d.perfectToday) {
    mood = '🥳'; cls = 'party'; expr = 'party';
    msg = pick(["We did EVERYTHING today!! 🎉", "Perfect day — I'm so proud of you.", "Legendary. Go rest, champ. 💛"]);
  } else if (d.doneToday > 0) {
    mood = '😊'; cls = 'happy'; expr = 'happy';
    msg = aff ? pick(AFFIRMATIONS) : `${d.doneToday} done, ${d.dueCount - d.doneToday} to go!`;
  } else if (h < 11) {
    mood = '😴'; expr = 'sleepy';
    msg = state.profile.name ? `Morning, ${state.profile.name}! Pick one quest to start.` : "Good morning! Pick one quest to start.";
  } else {
    mood = '🙂'; expr = 'normal';
    msg = aff ? pick(AFFIRMATIONS) : "Let's get one thing done.";
  }
  $('#mascotPet').innerHTML = window.petSVG ? window.petSVG(d.level, expr) : petEmoji(d.level);
  $('#mascotMsg').textContent = msg;
  $('#mascotMood').textContent = mood;
  m.className = 'mascot ' + cls;
}

function renderTopbar() {
  const d = derive();
  const h = new Date().getHours();
  const part = h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
  const name = state.profile.name ? `, ${state.profile.name}` : '';
  $('#greeting').textContent = `${part}${name}`;
  const now = new Date();
  $('#todayDate').textContent = `${WEEKDAY_FULL[now.getDay()]}, ${now.toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}`;
  $('#statLevel').textContent = 'Lv ' + d.level;
  $('#statLevelSub').textContent = d.xpInto + '/' + d.xpNeed + ' XP';
  $('#statPoints').textContent = d.balance;
  $('#statStreak').textContent = d.streak;
}

function renderToday() {
  const d = derive();
  // weekly ring
  const pct = d.weekGoal > 0 ? Math.min(1, d.weekPts / d.weekGoal) : 0;
  const C = 2 * Math.PI * 52;
  $('#weekRing').style.strokeDashoffset = String(C * (1 - pct));
  $('#weekPct').textContent = Math.round(pct * 100) + '%';
  $('#weekPts').textContent = d.weekPts;
  $('#weekGoal').textContent = d.weekGoal;
  $('#weekBar').style.width = (pct * 100) + '%';
  $('#weekSub').textContent = pct >= 1 ? '🎉 Weekly goal smashed!' :
    d.weekGoal > 0 ? `${d.weekGoal - d.weekPts} pts to go this week` : 'Set a weekly goal in settings.';

  // quest list
  const due = todaysTasks().slice().sort((a, b) => {
    const ac = isCompleted(a.id), bc = isCompleted(b.id);
    if (ac !== bc) return ac ? 1 : -1;                 // undone first
    return (taskTimeOn(a) || '99:99').localeCompare(taskTimeOn(b) || '99:99');
  });
  const list = $('#todayList');
  list.innerHTML = '';
  $('#todayCount').textContent = `${d.doneToday} / ${d.dueCount}`;
  $('#todayTitle').textContent = d.perfectToday ? "Today — all done! ✨" : "Today's quests";
  $('#todayEmpty').hidden = due.length > 0;
  due.forEach((t, i) => list.appendChild(questRow(t, i, animateToday)));
  animateToday = false;
}

const CHECK_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

function questRow(t, i, anim) {
  const done = isCompleted(t.id);
  const cat = catOf(t.category);
  const subs = t.subtasks || [];
  const sd = subDoneSet(t.id);
  const doneCount = subs.filter(s => sd.has(s.id)).length;
  const row = el('div', 'quest' + (done ? ' done' : '') + (anim ? ' in' : ''));
  if (anim) row.style.animationDelay = (i * 40) + 'ms';
  const catStyle = `background:var(--cat-${t.category}-soft)`;
  const tagStyle = `background:var(--cat-${t.category}-soft);color:var(--ink-soft)`;
  const eff = taskTimeOn(t);
  const timeTag = eff ? `<span class="tag time">⏰ ${eff}</span>` : '';
  const durTag = t.durationMin ? `<span class="tag time">⏱ ${t.durationMin}m</span>` : '';
  const stepsTag = subs.length ? `<span class="tag steps ${doneCount === subs.length ? 'done-all' : ''}" data-steps>☑ ${doneCount}/${subs.length}</span>` : '';
  row.innerHTML = `
    <div class="quest-line">
      <div class="quest-emoji" style="${catStyle}">${iconHTML(t.emoji || cat.icon)}</div>
      <div class="quest-main">
        <div class="quest-title">${esc(t.title)}</div>
        <div class="quest-meta">
          <span class="tag pts">🪙 ${t.points}</span>
          ${timeTag}${durTag}${stepsTag}
          <span class="tag" style="${tagStyle}">${esc(cat.label)}</span>
        </div>
      </div>
      <div class="quest-actions">
        <button class="focus-btn" aria-label="Focus timer" title="Focus timer">▶</button>
        <button class="check" aria-label="Complete quest">${CHECK_SVG}</button>
      </div>
    </div>`;
  if (subs.length) {
    const box = el('div', 'substeps'); box.hidden = true;
    subs.forEach(s => box.appendChild(subRow(t, s, sd.has(s.id))));
    row.appendChild(box);
    row.querySelector('[data-steps]').addEventListener('click', e => { e.stopPropagation(); box.hidden = !box.hidden; });
  }
  const toggle = () => toggleComplete(t, row);
  row.querySelector('.check').addEventListener('click', e => { e.stopPropagation(); toggle(); });
  row.querySelector('.focus-btn').addEventListener('click', e => { e.stopPropagation(); openFocus(t); });
  row.querySelector('.quest-line').addEventListener('click', toggle);
  row.addEventListener('contextmenu', e => { e.preventDefault(); openTaskModal(t); });
  return row;
}

function subRow(t, s, done) {
  const r = el('div', 'substep' + (done ? ' done' : ''));
  r.innerHTML = `<span class="sbox">${CHECK_SVG}</span><span class="s-title">${esc(s.title)}</span>`;
  r.addEventListener('click', e => { e.stopPropagation(); toggleSub(t, s.id, r); });
  return r;
}

/* ---- per-day subtask progress ---- */
function subDoneSet(taskId, k = todayKey()) {
  const dp = state.dayProgress[k] && state.dayProgress[k][taskId];
  return new Set((dp && dp.subDone) || []);
}
function toggleSub(t, subId, rowEl) {
  const k = todayKey();
  state.dayProgress[k] = state.dayProgress[k] || {};
  state.dayProgress[k][t.id] = state.dayProgress[k][t.id] || { subDone: [] };
  const arr = state.dayProgress[k][t.id].subDone;
  const idx = arr.indexOf(subId);
  const nowDone = idx < 0;
  if (idx >= 0) arr.splice(idx, 1); else arr.push(subId);
  haptic(8);
  const subs = t.subtasks || [];
  const allDone = subs.length > 0 && subs.every(s => arr.includes(s.id));
  save();
  if (allDone && state.profile.autoCompleteOnSteps && !isCompleted(t.id)) {
    burstConfetti(innerWidth / 2, innerHeight * 0.4, 26);
    toggleComplete(t, null);   // award points + celebrate; refreshes UI
    return;
  }
  // update in place so the checklist doesn't collapse / lose scroll
  if (rowEl) {
    rowEl.classList.toggle('done', nowDone);
    const quest = rowEl.closest('.quest');
    const tag = quest && quest.querySelector('[data-steps]');
    if (tag) {
      const doneCount = subs.filter(s => arr.includes(s.id)).length;
      tag.textContent = `☑ ${doneCount}/${subs.length}`;
      tag.classList.toggle('done-all', doneCount === subs.length);
    }
  } else {
    renderAll();
  }
}

function renderTasks() {
  const box = $('#taskManageList');
  box.innerHTML = '';
  $('#taskManageEmpty').hidden = state.tasks.length > 0;
  const sorted = state.tasks.slice().sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));
  sorted.forEach(t => {
    const row = el('div', 'manage-row');
    row.innerHTML = `
      <div class="quest-emoji" style="background:var(--cat-${t.category}-soft)">${iconHTML(t.emoji || catOf(t.category).icon)}</div>
      <div class="manage-body">
        <b>${esc(t.title)}</b>
        <div class="sub">${recurLabel(t.recur)} · ${t.points} pts${Object.keys(t.dayTimes || {}).length ? ' · ⏰ varies' : (t.reminder ? ' · ⏰ ' + t.reminder : '')}${t.active ? '' : ' · paused'}</div>
      </div>
      <div class="row-actions">
        <button class="mini-btn ${t.active ? '' : 'paused'}" data-act="pause" title="${t.active ? 'Pause' : 'Resume'}">${t.active ? '⏸' : '▶'}</button>
        <button class="mini-btn" data-act="edit" title="Edit">✏️</button>
      </div>`;
    row.querySelector('[data-act="edit"]').addEventListener('click', () => openTaskModal(t));
    row.querySelector('[data-act="pause"]').addEventListener('click', () => { t.active = !t.active; commit(); });
    box.appendChild(row);
  });
}
function recurLabel(r) {
  if (r.type === 'daily') return 'Every day';
  if (r.type === 'weekdays') return 'Weekdays';
  if (r.type === 'weekends') return 'Weekends';
  if (r.type === 'once') return 'One-time';
  if (r.type === 'monthly') return `Monthly on the ${ordinal(r.dom || 1)}`;
  if (r.type === 'quarterly') return `Every 3 months on the ${ordinal(r.dom || 1)}`;
  if (r.type === 'custom') return (r.days || []).map(d => WEEKDAY_FULL[d]).join(', ') || 'Custom';
  return 'Custom';
}

function renderRewards() {
  const d = derive();
  $('#rewardBalance').textContent = d.balance;
  const grid = $('#rewardList');
  grid.innerHTML = '';
  $('#rewardEmpty').hidden = state.rewards.length > 0;
  state.rewards.slice().sort((a, b) => a.cost - b.cost).forEach(r => {
    const locked = d.balance < r.cost;
    const card = el('div', 'reward' + (locked ? ' locked' : ''));
    card.innerHTML = `
      <button class="edit-dot" title="Edit">✏️</button>
      <div class="reward-emoji">${iconHTML(r.emoji || 'gift')}</div>
      <div class="reward-title">${esc(r.title)}</div>
      <div class="reward-cost">🪙 ${r.cost}</div>
      <button class="btn ${locked ? 'btn-ghost' : 'btn-primary'} btn-sm redeem">${locked ? `Need ${r.cost - d.balance} more` : 'Redeem'}</button>`;
    card.querySelector('.edit-dot').addEventListener('click', () => openRewardModal(r));
    const rb = card.querySelector('.redeem');
    if (locked) rb.disabled = true; else rb.addEventListener('click', () => redeem(r, card));
    grid.appendChild(card);
  });
  // history
  const hist = $('#redeemHistory');
  hist.innerHTML = '';
  const recent = state.redemptions.slice(-6).reverse();
  $('#historyHead').hidden = recent.length === 0;
  recent.forEach(r => {
    const row = el('div', 'history-row');
    const dt = new Date(r.ts);
    row.innerHTML = `${iconHTML(r.emoji || 'gift')}<div><b>${esc(r.title)}</b><div class="muted">${dt.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div></div><span class="h-cost">-${r.cost}</span>`;
    hist.appendChild(row);
  });
}

function renderYou() {
  const d = derive();
  $('#youLevel').textContent = d.level;
  $('#youTitle').textContent = LEVEL_TITLES[Math.min(d.level - 1, LEVEL_TITLES.length - 1)];
  $('#youXpInto').textContent = d.xpInto;
  $('#youXpNeed').textContent = d.xpNeed;
  $('#youNextLevel').textContent = d.level + 1;
  $('#youXpBar').style.width = (d.xpNeed ? (d.xpInto / d.xpNeed * 100) : 0) + '%';
  $('#youStreak').textContent = d.streak;
  $('#youBest').textContent = d.best;
  $('#youDone').textContent = d.totalDone;
  $('#youTotal').textContent = d.totalEarned;

  // week chart
  const chart = $('#weekChart'); chart.innerHTML = '';
  const vals = d.weekKeys.map(k => (state.completions[k] || []).reduce((a, c) => a + c.points, 0));
  const max = Math.max(10, ...vals);
  const tk = todayKey();
  d.wdates.forEach((date, i) => {
    const v = vals[i];
    const hpct = Math.round((v / max) * 100);
    const col = el('div', 'day-col');
    const isToday = keyOf(date) === tk;
    col.innerHTML = `<div class="day-bar ${v === 0 ? 'empty' : ''} ${isToday ? 'today' : ''}" style="height:${Math.max(v === 0 ? 5 : 10, hpct)}%" title="${v} pts"></div><span class="day-label">${WEEKDAY_SHORT[date.getDay()]}</span>`;
    chart.appendChild(col);
  });

  // badges
  const bg = $('#badgeGrid'); bg.innerHTML = '';
  BADGES.forEach(b => {
    const unlocked = !!state.badges[b.id];
    const cell = el('div', 'badge' + (unlocked ? ' unlocked' : ''));
    cell.innerHTML = `<span class="b-emoji">${b.emoji}</span><div class="b-name">${b.name}</div><div class="b-desc">${unlocked ? '✓ unlocked' : b.desc}</div>`;
    bg.appendChild(cell);
  });
}

/* ---------------- actions ---------------- */
function commit() { save(); renderAll(); scheduleReminders(); }

function toggleComplete(t, row) {
  const k = todayKey();
  state.completions[k] = state.completions[k] || [];
  const idx = state.completions[k].findIndex(c => c.taskId === t.id);
  if (idx >= 0) {
    state.completions[k].splice(idx, 1);       // undo
    save(); renderAll(); scheduleReminders();
    return;
  }
  const before = derive();
  state.completions[k].push({ taskId: t.id, title: t.title, emoji: t.emoji, points: t.points, ts: Date.now() });
  save();
  // feedback
  if (row) {
    row.classList.add('done', 'pop');
    const rect = row.querySelector('.check').getBoundingClientRect();
    floatPoints(rect.left + rect.width / 2, rect.top, '+' + t.points);
    burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 26);
  }
  haptic(18); playWin();
  const after = derive();
  renderAll(); scheduleReminders();
  // celebrations
  if (after.level > before.level) levelUp(after.level);
  if (after.weekPts >= after.weekGoal && before.weekPts < before.weekGoal && after.weekGoal > 0) {
    setTimeout(() => { toast('🏆', 'Weekly goal complete! Cash in a reward.', true); bigConfetti(); }, 400);
  } else if (after.perfectToday && !before.perfectToday) {
    setTimeout(() => { toast('✨', 'Perfect day — everything done!', true); bigConfetti(); }, 300);
  }
  checkBadges(after);
}

function redeem(r, card) {
  const d = derive();
  if (d.balance < r.cost) return;
  state.redemptions.push({ id: uid(), rewardId: r.id, title: r.title, emoji: r.emoji, cost: r.cost, dateKey: todayKey(), ts: Date.now() });
  save();
  if (card) { const rect = card.getBoundingClientRect(); burstConfetti(rect.left + rect.width / 2, rect.top + rect.height / 2, 40); }
  coin(); haptic(30);
  toast(r.emoji || '🎁', `Enjoy your reward: ${r.title}!`, true);
  renderAll();
  checkBadges(derive());
}

function checkBadges(d) {
  const newly = [];
  for (const b of BADGES) {
    if (!state.badges[b.id] && b.test(d)) { state.badges[b.id] = todayKey(); newly.push(b); }
  }
  if (newly.length) {
    save();
    let delay = 700;
    newly.forEach(b => { setTimeout(() => { toast(b.emoji, `Badge unlocked: ${b.name}!`, true); bigConfetti(); }, delay); delay += 1400; });
    renderYou();
  }
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

/* ---------------- feedback effects ---------------- */
let audioCtx = null;
function ac() { if (!audioCtx) { try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } return audioCtx; }
function tone(freq, start, dur, type = 'sine', gain = 0.14) {
  const c = ac(); if (!c || !state.profile.sound) return;
  const o = c.createOscillator(), g = c.createGain();
  o.type = type; o.frequency.value = freq;
  o.connect(g); g.connect(c.destination);
  const t0 = c.currentTime + start;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.start(t0); o.stop(t0 + dur + 0.02);
}
function ding() { tone(880, 0, 0.12, 'triangle'); tone(1320, 0.06, 0.14, 'sine'); }
function coin() { tone(988, 0, 0.09, 'square', 0.1); tone(1319, 0.08, 0.16, 'square', 0.1); }
function fanfare() { [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.1, 0.24, 'triangle', 0.12)); }
function twinkle() { [1047, 1319, 1568, 2093].forEach((f, i) => tone(f, i * 0.06, 0.22, 'sine', 0.1)); }
function arcade() { [660, 880, 660, 990, 1320].forEach((f, i) => tone(f, i * 0.05, 0.08, 'square', 0.07)); }
const WIN_SOUNDS = { chime: ding, coin: coin, fanfare: fanfare, twinkle: twinkle, arcade: arcade };
function playWin() { (WIN_SOUNDS[state.profile.winSound] || ding)(); }
function haptic(ms) { if (navigator.vibrate && state.profile.sound !== false) { try { navigator.vibrate(ms); } catch (e) {} } }

function floatPoints(x, y, text) {
  const e = el('div', 'float-pts', text);
  e.style.left = x + 'px'; e.style.top = y + 'px'; e.style.transform = 'translate(-50%,-50%)';
  $('#floatRoot').appendChild(e);
  setTimeout(() => e.remove(), 1000);
}
function toast(emoji, msg, big) {
  const t = el('div', 'toast' + (big ? ' big' : ''));
  t.innerHTML = `<span class="t-emoji">${iconHTML(emoji)}</span><span>${esc(msg)}</span>`;
  $('#toastRoot').appendChild(t);
  setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, big ? 2600 : 1900);
}

/* confetti */
const cv = $('#confetti'), cx = cv.getContext('2d');
let parts = [], rafOn = false;
function fitCanvas() { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; cx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0); }
addEventListener('resize', fitCanvas); fitCanvas();
const COLORS = ['#DD785B', '#EA994D', '#EFD353', '#C4C66A', '#B8CAA5', '#B4D8D4', '#80A4AA', '#D2CBE3', '#A299B8', '#DEA2A6'];
function burstConfetti(x, y, n) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, sp = 3 + Math.random() * 7;
    parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 3, g: 0.18 + Math.random() * 0.1,
      s: 5 + Math.random() * 6, rot: Math.random() * 6, vr: (Math.random() - .5) * .4,
      c: COLORS[(Math.random() * COLORS.length) | 0], life: 60 + Math.random() * 30, t: 0 });
  }
  if (!rafOn) { rafOn = true; requestAnimationFrame(tick); }
}
function bigConfetti() { const y = innerHeight * 0.3; for (let k = 0; k < 3; k++) setTimeout(() => burstConfetti(innerWidth * (0.2 + 0.3 * k), y, 40), k * 120); }
function tick() {
  cx.clearRect(0, 0, cv.width, cv.height);
  parts = parts.filter(p => p.t < p.life);
  for (const p of parts) {
    p.t++; p.vy += p.g; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
    cx.save(); cx.translate(p.x, p.y); cx.rotate(p.rot); cx.globalAlpha = Math.max(0, 1 - p.t / p.life);
    cx.fillStyle = p.c; cx.fillRect(-p.s / 2, -p.s / 2, p.s, p.s * 0.6); cx.restore();
  }
  if (parts.length) requestAnimationFrame(tick); else rafOn = false;
}
function levelUp(level) {
  fanfare(); haptic([30, 30, 60]);
  const ov = el('div', 'levelup');
  ov.innerHTML = `<div class="levelup-card"><div class="levelup-num">${level}</div><h2>Level up!</h2><p>${LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)]}</p></div>`;
  document.body.appendChild(ov);
  bigConfetti();
  ov.addEventListener('click', () => ov.remove());
  setTimeout(() => ov.remove(), 2600);
}

/* ---------------- focus timer ---------------- */
let focusState = null;
function fmt(s) { const m = Math.floor(s / 60), ss = s % 60; return m + ':' + String(ss).padStart(2, '0'); }
function nextQuestAfter(task) {
  const due = todaysTasks().filter(t => t.id !== task.id && !isCompleted(t.id));
  due.sort((a, b) => (taskTimeOn(a) || '99:99').localeCompare(taskTimeOn(b) || '99:99'));
  return due[0] || null;
}
function openFocus(task, overrideMin) {
  if (focusState) focusState.close();
  const mins = overrideMin || task.durationMin || state.profile.focusDefaultMin || 25;
  const total = mins * 60;
  const buffer = (state.profile.switchBufferMin || 2) * 60;
  const R = 130, C = 2 * Math.PI * R;
  const ov = el('div', 'focus');
  ov.innerHTML = `
    <button class="focus-close" aria-label="Close">✕</button>
    <div class="focus-quest"><span class="fq-emoji">${iconHTML(task.emoji || catOf(task.category).icon)}</span><span>${esc(task.title)}</span></div>
    <div class="focus-ring" id="fRing">
      <svg viewBox="0 0 300 300"><circle class="ft-track" cx="150" cy="150" r="${R}"/><circle class="ft-fill" id="fFill" cx="150" cy="150" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="0"/></svg>
      <div class="focus-time"><b id="fTime">${fmt(total)}</b><small>focus</small></div>
    </div>
    <div class="focus-controls">
      <button class="btn btn-ghost" id="fPause">Pause</button>
      <button class="btn btn-soft" id="fAdd">+5 min</button>
      <button class="btn btn-primary" id="fDone">Done ✓</button>
    </div>
    <p class="focus-hint" id="fHint">${esc(pick(START_LINES))}</p>
    <div class="focus-steps" id="fSteps"></div>`;
  document.body.appendChild(ov);
  const subs = task.subtasks || [];
  if (subs.length) { const sd = subDoneSet(task.id); subs.forEach(s => $('#fSteps').appendChild(subRow(task, s, sd.has(s.id)))); }

  const fill = ov.querySelector('#fFill');
  let remaining = total, paused = false, warned = false, ended = false;
  focusState = { close: () => { clearInterval(focusState.timer); ov.remove(); focusState = null; } };
  const draw = () => {
    fill.style.strokeDashoffset = String(C * (1 - Math.max(0, remaining) / total));
    $('#fTime').textContent = fmt(Math.max(0, remaining));
    ov.querySelector('#fRing').classList.toggle('warn', remaining <= buffer && remaining > 0);
  };
  draw();
  focusState.timer = setInterval(() => {
    if (paused) return;
    remaining--;
    if (remaining === buffer && !warned && buffer > 0) { warned = true; $('#fHint').textContent = '⏳ A few minutes left — start wrapping up.'; tone(660, 0, 0.16, 'sine', 0.1); haptic(20); }
    if (remaining <= 0 && !ended) { ended = true; clearInterval(focusState.timer); switchScreen(task, ov); return; }
    draw();
  }, 1000);

  ov.querySelector('.focus-close').addEventListener('click', () => focusState.close());
  ov.querySelector('#fPause').addEventListener('click', e => { paused = !paused; e.target.textContent = paused ? 'Resume' : 'Pause'; });
  ov.querySelector('#fAdd').addEventListener('click', () => { remaining += 300; ended = false; warned = false; draw(); });
  ov.querySelector('#fDone').addEventListener('click', () => { focusState.close(); if (!isCompleted(task.id)) toggleComplete(task, null); bigConfetti(); toast('✅', 'Focus session done!', true); });
}
function switchScreen(task, ov) {
  fanfare(); haptic([40, 40, 90]);
  fireNotify('⏰ Time to switch!', `Great focus on "${task.title}". Ready for the next one?`);
  const next = nextQuestAfter(task);
  ov.classList.add('switch');
  ov.innerHTML = `
    <div class="switch-big pulse">⏰ Time to switch!</div>
    <p class="switch-next">${next ? `Next up: <b>${esc(next.title)}</b>` : "That's your quests — nice work! 🎉"}</p>
    <div class="focus-controls" style="flex-wrap:wrap;justify-content:center">
      ${next ? '<button class="btn btn-primary" id="sNext">Start next ▶</button>' : ''}
      <button class="btn btn-soft" id="sSnooze">Snooze 5 min</button>
      <button class="btn btn-ghost" id="sClose">I'm done</button>
    </div>`;
  bigConfetti();
  if (next) ov.querySelector('#sNext').addEventListener('click', () => { ov.remove(); focusState = null; openFocus(next); });
  ov.querySelector('#sSnooze').addEventListener('click', () => { ov.remove(); focusState = null; openFocus(task, 5); });
  ov.querySelector('#sClose').addEventListener('click', () => { ov.remove(); focusState = null; });
}

/* ---------------- brain dump ---------------- */
function openBrainDump() {
  const { scrim, sheet } = openSheet(`
    <h2>Brain dump 🧠</h2>
    <p class="sheet-sub">Got a thought pulling your focus? Park it here so you can let it go.</p>
    <div class="bd-input"><input id="bdText" type="text" placeholder="Type anything…" maxlength="140" autocomplete="off" /><button class="btn btn-primary" id="bdAdd">Add</button></div>
    <div class="bd-list" id="bdList"></div>`);
  const render = () => {
    const list = sheet.querySelector('#bdList'); list.innerHTML = '';
    if (!state.brainDump.length) { list.innerHTML = '<div class="bd-empty">Nothing here yet.<br>Empty your head — you can turn notes into quests later.</div>'; return; }
    state.brainDump.slice().reverse().forEach(item => {
      const row = el('div', 'bd-item');
      row.innerHTML = `<span class="bd-text">${esc(item.text)}</span><button class="mini-btn" data-act="quest" title="Turn into quest">🎯</button><button class="mini-btn" data-act="del" title="Delete">🗑</button>`;
      row.querySelector('[data-act="quest"]').addEventListener('click', () => { state.brainDump = state.brainDump.filter(x => x.id !== item.id); save(); closeSheet(scrim); openTaskModal(null, item.text); });
      row.querySelector('[data-act="del"]').addEventListener('click', () => { state.brainDump = state.brainDump.filter(x => x.id !== item.id); save(); render(); });
      list.appendChild(row);
    });
  };
  const add = () => { const v = sheet.querySelector('#bdText').value.trim(); if (!v) return; state.brainDump.push({ id: uid(), text: v, ts: Date.now() }); save(); sheet.querySelector('#bdText').value = ''; render(); haptic(8); };
  sheet.querySelector('#bdAdd').addEventListener('click', add);
  sheet.querySelector('#bdText').addEventListener('keydown', e => { if (e.key === 'Enter') add(); });
  render();
  setTimeout(() => sheet.querySelector('#bdText').focus(), 60);
}

/* ---------------- modals ---------------- */
function openSheet(inner) {
  const scrim = el('div', 'scrim');
  const sheet = el('div', 'sheet');
  sheet.innerHTML = `<div class="sheet-grip"></div>` + inner;
  scrim.appendChild(sheet);
  scrim.addEventListener('click', e => { if (e.target === scrim) closeSheet(scrim); });
  $('#modalRoot').appendChild(scrim);
  return { scrim, sheet };
}
function closeSheet(scrim) { scrim.style.animation = 'fade .2s reverse'; scrim.querySelector('.sheet').style.animation = 'sheetUp .28s reverse'; setTimeout(() => scrim.remove(), 200); }

function emojiPicker(list, selected) {
  return `<div class="emoji-pick">${list.map(e => `<button type="button" data-emoji="${e}" class="${e === selected ? 'sel' : ''}">${iconHTML(e)}</button>`).join('')}</div>`;
}

function openTaskModal(task, prefillTitle) {
  const editing = !!task;
  const t = task || { title: prefillTitle || '', emoji: 'book', category: 'homework', points: 10, recur: { type: 'daily', days: [], date: todayKey() }, reminder: '', durationMin: null, subtasks: [], dayTimes: {}, active: true };
  const cur = { emoji: t.emoji, category: t.category, points: t.points, recurType: t.recur.type, dom: t.recur.dom || new Date().getDate(), days: (t.recur.days || []).slice(), steps: (t.subtasks || []).map(s => ({ id: s.id, title: s.title })), perDay: Object.keys(t.dayTimes || {}).length > 0, dayTimes: Object.assign({}, t.dayTimes || {}) };
  const { scrim, sheet } = openSheet(`
    <h2>${editing ? 'Edit quest' : 'New quest'}</h2>
    <p class="sheet-sub">${editing ? 'Update this quest.' : 'What do you need to get done?'}</p>
    <label class="field"><span>Quest name</span><input id="tTitle" type="text" placeholder="e.g. Math homework" value="${esc(t.title)}" maxlength="60" /></label>
    <div class="field"><span>Icon</span>${emojiPicker(TASK_EMOJIS, cur.emoji)}</div>
    <div class="field"><span>Category</span><div class="chip-row" id="tCats">${CATEGORIES.map(c => `<button type="button" class="chip ${c.id === cur.category ? 'sel' : ''}" data-cat="${c.id}">${iconHTML(c.icon)} ${c.label}</button>`).join('')}</div></div>
    <div class="field"><span>Points reward</span><div class="stepper"><button type="button" data-step="-5">−</button><input id="tPoints" type="number" value="${cur.points}" min="1" max="500" inputmode="numeric" /><button type="button" data-step="5">+</button></div></div>
    <div class="field"><span>Repeats</span><div class="chip-row" id="tRecur">
      ${['daily:Every day', 'weekdays:Weekdays', 'weekends:Weekends', 'custom:Pick days', 'monthly:Monthly', 'quarterly:Every 3 months', 'once:Just once'].map(x => { const [v, l] = x.split(':'); return `<button type="button" class="chip ${v === cur.recurType ? 'sel' : ''}" data-recur="${v}">${l}</button>`; }).join('')}
    </div></div>
    <div class="field" id="tDaysWrap" ${cur.recurType === 'custom' ? '' : 'hidden'}><span>On these days</span><div class="day-picker" id="tDays">${WEEKDAY_SHORT.map((d, i) => `<button type="button" class="${cur.days.includes(i) ? 'sel' : ''}" data-day="${i}">${d}</button>`).join('')}</div></div>
    <label class="field" id="tDomWrap" ${cur.recurType === 'monthly' || cur.recurType === 'quarterly' ? '' : 'hidden'}><span>Day of the month</span><input id="tDom" type="number" value="${cur.dom}" min="1" max="31" inputmode="numeric" /><small class="field-hint">Every 3 months = Jan, Apr, Jul &amp; Oct.</small></label>
    <label class="field"><span>Start / reminder time (optional)</span><input id="tRemind" type="time" value="${t.reminder || ''}" /><small class="field-hint">I'll nudge you to start — and (with a focus length) tell you when to switch. Needs notifications on.</small></label>
    <div class="settings-row perday-row"><div class="sr-label"><b>Different time on some days?</b><small>e.g. later bedtime Fri &amp; Sat</small></div><div class="switch ${cur.perDay ? 'on' : ''}" id="tPerDay"></div></div>
    <div class="field" id="tDayWrap" ${cur.perDay ? '' : 'hidden'}><div id="tDayTimes"></div><small class="field-hint">Sets the time per day. Leave a day blank for no time that day.</small></div>
    <label class="field"><span>Focus length (minutes, optional)</span><input id="tDur" type="number" value="${t.durationMin || ''}" min="1" max="240" placeholder="${state.profile.focusDefaultMin}" inputmode="numeric" /><small class="field-hint">Used by the focus timer ▶ and the switch alert.</small></label>
    <div class="field"><span>Steps / checklist (optional)</span><div class="step-editor" id="tSteps"></div><button type="button" class="btn btn-ghost btn-sm add-step" id="tAddStep">+ Add step</button></div>
    <div class="sheet-actions">
      ${editing ? '<button class="btn btn-danger" id="tDelete">Delete</button>' : ''}
      <button class="btn btn-primary" id="tSave">${editing ? 'Save' : 'Add quest'}</button>
    </div>`);

  sheet.querySelector('.emoji-pick').addEventListener('click', e => { const b = e.target.closest('[data-emoji]'); if (!b) return; cur.emoji = b.dataset.emoji; sheet.querySelectorAll('.emoji-pick button').forEach(x => x.classList.toggle('sel', x === b)); });
  sheet.querySelector('#tCats').addEventListener('click', e => { const b = e.target.closest('[data-cat]'); if (!b) return; cur.category = b.dataset.cat; sheet.querySelectorAll('#tCats .chip').forEach(x => x.classList.toggle('sel', x === b)); });
  sheet.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => { const inp = sheet.querySelector('#tPoints'); inp.value = Math.max(1, (parseInt(inp.value) || 0) + parseInt(b.dataset.step)); }));
  sheet.querySelector('#tRecur').addEventListener('click', e => { const b = e.target.closest('[data-recur]'); if (!b) return; cur.recurType = b.dataset.recur; sheet.querySelectorAll('#tRecur .chip').forEach(x => x.classList.toggle('sel', x === b)); sheet.querySelector('#tDaysWrap').hidden = cur.recurType !== 'custom'; sheet.querySelector('#tDomWrap').hidden = cur.recurType !== 'monthly' && cur.recurType !== 'quarterly'; });
  sheet.querySelector('#tDays').addEventListener('click', e => { const b = e.target.closest('[data-day]'); if (!b) return; const dy = +b.dataset.day; const i = cur.days.indexOf(dy); if (i >= 0) cur.days.splice(i, 1); else cur.days.push(dy); b.classList.toggle('sel'); });

  // per-day times
  const activeDows = () => {
    const order = [1, 2, 3, 4, 5, 6, 0];
    if (cur.recurType === 'daily') return order;
    if (cur.recurType === 'weekdays') return [1, 2, 3, 4, 5];
    if (cur.recurType === 'weekends') return [6, 0];
    if (cur.recurType === 'custom') return order.filter(d => cur.days.includes(d));
    return [];
  };
  const seedDayTimes = () => { const def = sheet.querySelector('#tRemind').value || ''; activeDows().forEach(d => { if (cur.dayTimes[d] == null) cur.dayTimes[d] = def; }); };
  const renderDayTimes = () => {
    const box = sheet.querySelector('#tDayTimes'); box.innerHTML = '';
    const dows = activeDows();
    if (!dows.length) { box.innerHTML = '<p class="field-hint">Pick your repeat days first.</p>'; return; }
    dows.forEach(d => {
      const val = (cur.dayTimes[d] != null) ? cur.dayTimes[d] : (sheet.querySelector('#tRemind').value || '');
      const row = el('div', 'daytime-row');
      row.innerHTML = `<span>${WEEKDAY_FULL[d]}</span><input type="time" data-dow="${d}" value="${val}" />`;
      row.querySelector('input').addEventListener('input', e => { cur.dayTimes[d] = e.target.value; });
      box.appendChild(row);
    });
  };
  sheet.querySelector('#tPerDay').addEventListener('click', e => {
    cur.perDay = !cur.perDay;
    e.currentTarget.classList.toggle('on', cur.perDay);
    sheet.querySelector('#tDayWrap').hidden = !cur.perDay;
    if (cur.perDay) { seedDayTimes(); renderDayTimes(); }
  });
  sheet.querySelector('#tRecur').addEventListener('click', () => { if (cur.perDay) { seedDayTimes(); renderDayTimes(); } });
  sheet.querySelector('#tDays').addEventListener('click', () => { if (cur.perDay) { seedDayTimes(); renderDayTimes(); } });
  if (cur.perDay) renderDayTimes();

  const renderSteps = () => {
    const box = sheet.querySelector('#tSteps'); box.innerHTML = '';
    cur.steps.forEach((s, idx) => {
      const r = el('div', 'step-row');
      r.innerHTML = `<input type="text" value="${esc(s.title)}" placeholder="Step ${idx + 1}" maxlength="60" /><button type="button" class="mini-btn" title="Remove">✕</button>`;
      r.querySelector('input').addEventListener('input', e => { s.title = e.target.value; });
      r.querySelector('.mini-btn').addEventListener('click', () => { cur.steps.splice(idx, 1); renderSteps(); });
      box.appendChild(r);
    });
  };
  sheet.querySelector('#tAddStep').addEventListener('click', () => { cur.steps.push({ id: uid(), title: '' }); renderSteps(); });
  renderSteps();

  sheet.querySelector('#tSave').addEventListener('click', () => {
    const title = sheet.querySelector('#tTitle').value.trim();
    if (!title) { sheet.querySelector('#tTitle').focus(); return; }
    if (cur.recurType === 'custom' && cur.days.length === 0) { toast('📅', 'Pick at least one day.'); return; }
    const points = Math.max(1, parseInt(sheet.querySelector('#tPoints').value) || 1);
    const reminder = sheet.querySelector('#tRemind').value || '';
    const durationMin = parseInt(sheet.querySelector('#tDur').value) || null;
    const subtasks = cur.steps.map(s => ({ id: s.id || uid(), title: (s.title || '').trim() })).filter(s => s.title);
    const recur = { type: cur.recurType, days: cur.days.slice(), date: (task && task.recur.date) || todayKey() };
    if (cur.recurType === 'monthly' || cur.recurType === 'quarterly') recur.dom = Math.min(31, Math.max(1, parseInt(sheet.querySelector('#tDom').value) || 1));
    const dayTimes = {};
    if (cur.perDay) activeDows().forEach(d => { if (cur.dayTimes[d] != null) dayTimes[d] = cur.dayTimes[d]; });
    if (editing) {
      Object.assign(task, { title, emoji: cur.emoji, category: cur.category, points, recur, reminder, durationMin, subtasks, dayTimes });
    } else {
      state.tasks.push({ id: uid(), title, emoji: cur.emoji, category: cur.category, points, recur, reminder, durationMin, subtasks, dayTimes, active: true, createdAt: Date.now() });
      toast('🎯', 'Quest added!');
    }
    closeSheet(scrim); commit();
  });
  if (editing) sheet.querySelector('#tDelete').addEventListener('click', () => {
    if (!confirm('Delete this quest? Your past completions are kept.')) return;
    state.tasks = state.tasks.filter(x => x.id !== task.id);
    closeSheet(scrim); commit();
  });
}

function openRewardModal(reward) {
  const editing = !!reward;
  const r = reward || { title: '', emoji: 'game', cost: 100 };
  const cur = { emoji: r.emoji };
  const { scrim, sheet } = openSheet(`
    <h2>${editing ? 'Edit reward' : 'New reward'}</h2>
    <p class="sheet-sub">Something worth working toward.</p>
    <label class="field"><span>Reward</span><input id="rTitle" type="text" placeholder="e.g. 30 min game time" value="${esc(r.title)}" maxlength="50" /></label>
    <div class="field"><span>Icon</span>${emojiPicker(REWARD_EMOJIS, cur.emoji)}</div>
    <div class="field"><span>Cost in points</span><div class="stepper"><button type="button" data-step="-10">−</button><input id="rCost" type="number" value="${r.cost}" min="5" max="9999" inputmode="numeric" /><button type="button" data-step="10">+</button></div></div>
    <div class="sheet-actions">
      ${editing ? '<button class="btn btn-danger" id="rDelete">Delete</button>' : ''}
      <button class="btn btn-primary" id="rSave">${editing ? 'Save' : 'Add reward'}</button>
    </div>`);
  sheet.querySelector('.emoji-pick').addEventListener('click', e => { const b = e.target.closest('[data-emoji]'); if (!b) return; cur.emoji = b.dataset.emoji; sheet.querySelectorAll('.emoji-pick button').forEach(x => x.classList.toggle('sel', x === b)); });
  sheet.querySelectorAll('[data-step]').forEach(b => b.addEventListener('click', () => { const inp = sheet.querySelector('#rCost'); inp.value = Math.max(5, (parseInt(inp.value) || 0) + parseInt(b.dataset.step)); }));
  sheet.querySelector('#rSave').addEventListener('click', () => {
    const title = sheet.querySelector('#rTitle').value.trim();
    if (!title) { sheet.querySelector('#rTitle').focus(); return; }
    const cost = Math.max(5, parseInt(sheet.querySelector('#rCost').value) || 5);
    if (editing) Object.assign(reward, { title, emoji: cur.emoji, cost });
    else { state.rewards.push({ id: uid(), title, emoji: cur.emoji, cost, createdAt: Date.now() }); toast('🎁', 'Reward added!'); }
    closeSheet(scrim); commit();
  });
  if (editing) sheet.querySelector('#rDelete').addEventListener('click', () => {
    if (!confirm('Delete this reward?')) return;
    state.rewards = state.rewards.filter(x => x.id !== reward.id);
    closeSheet(scrim); commit();
  });
}

function openSettings() {
  const p = state.profile;
  const { scrim, sheet } = openSheet(`
    <h2>Settings</h2>
    <p class="sheet-sub">Make Questly yours.</p>
    <label class="field"><span>Your name</span><input id="sName" type="text" value="${esc(p.name)}" maxlength="24" /></label>
    <div class="field"><span>Weekly points goal</span><div class="stepper"><button type="button" data-gstep="-25">−</button><input id="sGoal" type="number" value="${p.weeklyGoal}" min="20" step="10" inputmode="numeric" /><button type="button" data-gstep="25">+</button></div></div>
    <div class="field"><span>Theme</span><div class="chip-row" id="sTheme">${['auto:Auto', 'light:Light', 'dark:Dark'].map(x => { const [v, l] = x.split(':'); return `<button type="button" class="chip ${p.theme === v ? 'sel' : ''}" data-theme="${v}">${l}</button>`; }).join('')}</div></div>
    <label class="field"><span>Pet's name</span><input id="sMascot" type="text" value="${esc((p.mascot && p.mascot.name) || '')}" maxlength="16" placeholder="Sprout" /></label>
    <div class="field"><span>Celebration sound</span><div class="sound-grid" id="sSounds">${['chime', 'coin', 'twinkle', 'fanfare', 'arcade'].map(s => `<button type="button" class="chip ${p.winSound === s ? 'sel' : ''}" data-sound="${s}">${s}</button>`).join('')}</div></div>
    <div class="field"><span>Default focus length (minutes)</span><div class="stepper"><button type="button" data-fstep="-5">−</button><input id="sFocus" type="number" value="${p.focusDefaultMin}" min="5" step="5" inputmode="numeric" /><button type="button" data-fstep="5">+</button></div></div>
    <div class="settings-row"><div class="sr-label"><b>Sound & vibration</b><small>Chimes and buzzes on wins</small></div><div class="switch ${p.sound ? 'on' : ''}" id="sSound"></div></div>
    <div class="settings-row"><div class="sr-label"><b>Encouraging messages</b><small>Affirmations from your pet & on wins</small></div><div class="switch ${p.affirmations ? 'on' : ''}" id="sAffirm"></div></div>
    <div class="settings-row"><div class="sr-label"><b>Reminders</b><small>Nudges at start times (keep the app installed)</small></div><div class="switch ${p.notify ? 'on' : ''}" id="sNotify"></div></div>
    <div class="settings-row"><div class="sr-label"><b>Switch-time alerts</b><small>Ping me when it's time to move to the next quest</small></div><div class="switch ${p.transitionAlerts ? 'on' : ''}" id="sTrans"></div></div>
    <div class="section-head" style="margin:22px 4px 8px"><h3>Data</h3></div>
    <div class="sheet-actions" style="margin-top:6px">
      <button class="btn btn-ghost btn-sm" id="sExport">⬇ Export</button>
      <button class="btn btn-ghost btn-sm" id="sImport">⬆ Import</button>
    </div>
    <button class="btn btn-danger btn-sm" id="sReset" style="width:100%;margin-top:10px">Reset everything</button>
    <p class="muted" style="text-align:center;margin-top:16px">Questly · all data stays on this device 🔒</p>
    <input id="sFile" type="file" accept="application/json" hidden />`);

  sheet.querySelectorAll('[data-gstep]').forEach(b => b.addEventListener('click', () => { const inp = sheet.querySelector('#sGoal'); inp.value = Math.max(20, (parseInt(inp.value) || 0) + parseInt(b.dataset.gstep)); }));
  sheet.querySelector('#sTheme').addEventListener('click', e => { const b = e.target.closest('[data-theme]'); if (!b) return; p.theme = b.dataset.theme; sheet.querySelectorAll('#sTheme .chip').forEach(x => x.classList.toggle('sel', x === b)); applyTheme(); save(); });
  sheet.querySelector('#sSound').addEventListener('click', e => { p.sound = !p.sound; e.currentTarget.classList.toggle('on', p.sound); save(); if (p.sound) ding(); });
  sheet.querySelector('#sNotify').addEventListener('click', async e => {
    if (!p.notify) {
      const ok = await enableNotifications();
      p.notify = ok; e.currentTarget.classList.toggle('on', ok); save(); scheduleReminders();
      if (ok) { fireNotify('🔔 Reminders on!', "I'll nudge you at your quest times."); }
      else toast('🔕', 'Notifications were blocked in your browser.');
    } else { p.notify = false; e.currentTarget.classList.remove('on'); save(); scheduleReminders(); }
  });
  sheet.querySelector('#sName').addEventListener('input', e => { p.name = e.target.value; save(); renderTopbar(); renderMascot(); });
  sheet.querySelector('#sGoal').addEventListener('input', e => { p.weeklyGoal = Math.max(20, parseInt(e.target.value) || 20); save(); renderToday(); });
  sheet.querySelector('#sMascot').addEventListener('input', e => { p.mascot = p.mascot || {}; p.mascot.name = e.target.value; save(); renderMascot(); });
  sheet.querySelector('#sSounds').addEventListener('click', e => { const b = e.target.closest('[data-sound]'); if (!b) return; p.winSound = b.dataset.sound; sheet.querySelectorAll('#sSounds .chip').forEach(x => x.classList.toggle('sel', x === b)); save(); (WIN_SOUNDS[p.winSound] || ding)(); });
  sheet.querySelectorAll('[data-fstep]').forEach(b => b.addEventListener('click', () => { const inp = sheet.querySelector('#sFocus'); inp.value = Math.max(5, (parseInt(inp.value) || 0) + parseInt(b.dataset.fstep)); p.focusDefaultMin = parseInt(inp.value); save(); }));
  sheet.querySelector('#sFocus').addEventListener('input', e => { p.focusDefaultMin = Math.max(5, parseInt(e.target.value) || 25); save(); });
  sheet.querySelector('#sAffirm').addEventListener('click', e => { p.affirmations = !p.affirmations; e.currentTarget.classList.toggle('on', p.affirmations); save(); renderMascot(); });
  sheet.querySelector('#sTrans').addEventListener('click', e => { p.transitionAlerts = !p.transitionAlerts; e.currentTarget.classList.toggle('on', p.transitionAlerts); save(); scheduleReminders(); });
  sheet.querySelector('#sExport').addEventListener('click', exportData);
  sheet.querySelector('#sImport').addEventListener('click', () => sheet.querySelector('#sFile').click());
  sheet.querySelector('#sFile').addEventListener('change', importData);
  sheet.querySelector('#sReset').addEventListener('click', () => {
    if (!confirm('This erases ALL quests, points and rewards. Are you sure?')) return;
    state = defaultState(); save(); location.reload();
  });
}

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const a = el('a'); a.href = URL.createObjectURL(blob); a.download = 'questly-backup.json'; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000); toast('⬇', 'Backup downloaded.');
}
function importData(e) {
  const file = e.target.files[0]; if (!file) return;
  const r = new FileReader();
  r.onload = () => { try {
    const data = JSON.parse(r.result); if (!data.tasks) throw 0;
    if (data.pack) {
      // task pack: add its quests on top of what's already here (keeps points, settings, other quests)
      data.tasks.forEach(t => state.tasks.push(Object.assign({ reminder: '', durationMin: null, dayTimes: {}, active: true }, t, {
        id: uid(), createdAt: Date.now(), subtasks: (t.subtasks || []).map(s => ({ id: uid(), title: s.title || s })),
      })));
      state.onboarded = true; save(); location.reload(); return;
    }
    state = Object.assign(defaultState(), data); save(); location.reload();
  } catch (err) { toast('⚠️', "That file couldn't be read."); } };
  r.readAsText(file);
}

/* ---------------- notifications ---------------- */
async function enableNotifications() {
  if (!('Notification' in window)) return false;
  try { const perm = await Notification.requestPermission(); return perm === 'granted'; } catch (e) { return false; }
}
function fireNotify(title, body) {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  if (sw && sw.active) { sw.active.postMessage({ type: 'notify', title, body, tag: 'q' + Date.now() }); }
  else { try { new Notification(title, { body, icon: 'icons/icon-192.png' }); } catch (e) {} }
}
function scheduleReminders() {
  reminderTimers.forEach(clearTimeout); reminderTimers = [];
  if (!state.profile.notify || !('Notification' in window) || Notification.permission !== 'granted') return;
  const now = Date.now();
  todaysTasks().filter(t => !isCompleted(t.id)).forEach(t => {
    const rem = taskTimeOn(t);
    if (!rem) return;
    const [h, m] = rem.split(':').map(Number);
    const start = new Date(); start.setHours(h, m, 0, 0);
    const dStart = start.getTime() - now;
    // start / reminder ping
    if (dStart > 0 && dStart < 86400000) {
      reminderTimers.push(setTimeout(() => { if (!isCompleted(t.id)) fireNotify(`▶ Time to start: ${t.title}`, `${t.points} points waiting — just begin. 🌱`); }, dStart));
    }
    // switch ping at start + focus length
    if (state.profile.transitionAlerts && t.durationMin) {
      const dEnd = dStart + t.durationMin * 60000;
      if (dEnd > 0 && dEnd < 86400000) {
        reminderTimers.push(setTimeout(() => {
          if (!isCompleted(t.id)) { const nx = nextQuestAfter(t); fireNotify(`⏰ Time to switch off ${t.title}`, nx ? `Next up: ${nx.title}` : 'Wrap it up — great work!'); }
        }, dEnd));
      }
    }
  });
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) { renderAll(); scheduleReminders(); } });

/* ---------------- navigation ---------------- */
function goTo(view) {
  const changed = view !== currentView;
  currentView = view;
  $$('.view').forEach(v => v.hidden = v.dataset.view !== view);
  $$('.tab[data-tab]').forEach(t => t.classList.toggle('is-active', t.dataset.tab === view));
  $('.scroll').scrollTop = 0;
  if (view === 'today' && changed) { animateToday = true; renderToday(); }
}

/* ---------------- onboarding ---------------- */
function sampleData() {
  const mk = (title, emoji, category, points, recur, reminder, durationMin, steps, dayTimes) => ({
    id: uid(), title, emoji, category, points, recur, reminder: reminder || '',
    durationMin: durationMin || null, subtasks: (steps || []).map(x => ({ id: uid(), title: x })),
    dayTimes: dayTimes || {}, active: true, createdAt: Date.now(),
  });
  state.tasks = [
    mk('Math homework', 'note', 'homework', 15, { type: 'weekdays', days: [] }, '16:30', 30),
    mk('Read for 20 min', 'book', 'homework', 10, { type: 'daily', days: [] }, '19:30', 20),
    mk('Reply to work emails', 'laptop', 'work', 10, { type: 'weekdays', days: [] }, '09:00', 25),
    mk('Get ready for the day', 'tooth', 'routine', 10, { type: 'daily', days: [] }, '07:30', null, ['Brush teeth', 'Get dressed', 'Pack bag']),
    mk('Make my bed', 'bed', 'chores', 5, { type: 'daily', days: [] }, '08:00'),
    mk('Feed the pet', 'dog', 'chores', 5, { type: 'daily', days: [] }, ''),
    mk('Tidy my room', 'broom', 'chores', 10, { type: 'custom', days: [0, 3] }, '', 15, ['Clear the desk', 'Put clothes away', 'Quick floor pickup']),
    mk('Move my body', 'dumbbell', 'health', 10, { type: 'custom', days: [1, 3, 5] }, '17:00', 20),
    mk('Brush teeth (night)', 'tooth', 'routine', 5, { type: 'daily', days: [] }, '20:30'),
    mk('Bedtime', 'moon', 'routine', 5, { type: 'daily', days: [] }, '19:30', null, null, { 5: '21:00', 6: '21:00' }),
  ];
  state.rewards = [
    { id: uid(), title: '30 min screen time', emoji: 'game', cost: 50, createdAt: Date.now() },
    { id: uid(), title: 'Ice cream treat', emoji: 'icecream', cost: 80, createdAt: Date.now() },
    { id: uid(), title: 'Pick tonight\'s dinner', emoji: 'pizza', cost: 100, createdAt: Date.now() },
    { id: uid(), title: 'Movie night', emoji: 'movie', cost: 150, createdAt: Date.now() },
    { id: uid(), title: 'Big weekend reward', emoji: 'gift', cost: 500, createdAt: Date.now() },
  ];
}
function finishOnboard(withSample) {
  state.profile.name = $('#obName').value.trim();
  state.profile.weeklyGoal = Math.max(20, parseInt($('#obGoal').value) || 300);
  if (withSample) sampleData();
  state.onboarded = true; save();
  $('#onboard').hidden = true; $('#app').hidden = false;
  renderAll(); goTo('today');
  if (!withSample && state.tasks.length === 0) setTimeout(() => openTaskModal(null), 400);
}

/* ---------------- boot ---------------- */
function registerSW() {
  // Offline + installable: register the service worker (works over https or localhost).
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js').then(r => { sw = r; }).catch(() => {});
  }
}
function bind() {
  document.addEventListener('click', e => {
    const goto = e.target.closest('[data-goto]'); if (goto) return goTo(goto.dataset.goto);
    const tab = e.target.closest('.tab[data-tab]'); if (tab) return goTo(tab.dataset.tab);
    if (e.target.closest('[data-add-task]')) return openTaskModal(null);
    if (e.target.closest('[data-add-reward]')) return openRewardModal(null);
  });
  $('#btnSettings').addEventListener('click', openSettings);
  $('#btnBrainDump').addEventListener('click', openBrainDump);
  $('#mascot').addEventListener('click', () => { renderMascot(); haptic(8); });
  $('#obStart').addEventListener('click', () => finishOnboard(false));
  $('#obSample').addEventListener('click', () => finishOnboard(true));
}
function boot() {
  applyTheme(); bind(); registerSW();
  if (state.onboarded) { $('#app').hidden = false; renderAll(); goTo('today'); scheduleReminders(); }
  else { $('#onboard').hidden = false; }
}
boot();
