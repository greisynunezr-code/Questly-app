# ✦ Questly — Daily Quests & Rewards

An ADHD-friendly daily task app. Turn homework, chores and routines into **quests**,
earn **points**, keep **streaks**, **level up**, and cash in **weekly rewards** you choose.

Everything runs in the browser and **all your data stays on your device** (nothing is
uploaded anywhere). It's a PWA, so you can install it to your phone or computer home screen.

---

## ✨ What's inside

- **Today view** – one-tap check-off with a satisfying pop, confetti, sound & buzz
- **Focus timer** ⏱ – tap ▶ on any quest for a full-screen countdown that keeps you on task
- **"Time to switch" alerts** – the hardest ADHD moment. A gentle "wrap up" warning near the end, then a firm *switch → next quest* prompt (in-app **and** as a notification). Works two ways: the focus timer, plus scheduled pings at each quest's start time + focus length.
- **Subtasks / checklists** ☑ – break a quest into steps; it auto-completes when every step is done
- **Brain dump** 🧠 – a quick-capture inbox (topbar button) to park stray thoughts, then turn any note into a quest
- **Pet buddy** 🥚→🦉 – a mascot that reacts to your day (sleepy → happy → celebrating), evolves as you level up, and cheers you on
- **Points + reward store** – set your own rewards (screen time, treats, outings) and redeem when you've earned enough
- **Streaks** 🔥, **Levels & XP** 🚀, **Badges** 🏅 (14 to unlock), and a **weekly goal ring**
- **Six categories** incl. **Work**, color-coded so quest types are easy to scan
- **Motivation** – rotating encouragements, custom celebration sounds (chime / coin / twinkle / fanfare / arcade)
- **Recurring quests** – daily / weekdays / weekends / pick-your-days / one-time
- **Reminders** ⏰ – optional nudges at each quest's start time (needs notifications on + app installed)
- **Warm pastel theme** in **light & dark**, plus **export/import** backup of your data

> Updating from an earlier version? Your saved data carries over automatically. If the
> look doesn't change, hard-refresh once (Ctrl/Cmd+Shift+R) to pick up the new files.

---

## ▶️ Run it on your computer (quick test)

A PWA needs to be *served* (not opened as a file) for install & reminders to work.
Open a terminal **in this folder** and run one of these:

**Python (already on your PC):**
```
python -m http.server 8080
```

**Node:**
```
npx serve -l 8080
```

Then open **http://localhost:8080** in Chrome or Edge.

> You can also just double-click `index.html` to try it, but "Install", offline mode
> and notifications only work over `http://localhost` or a real `https://` address.

---

## 📱 Get it on your phone

Pick whichever is easiest for you:

### Option A — Free hosting (best; works anywhere)
1. Go to **https://app.netlify.com/drop**
2. Drag this whole `Schedule app` folder onto the page.
3. You get a link like `https://your-name.netlify.app`.
4. Open that link **on your phone** → then:
   - **iPhone (Safari):** Share → **Add to Home Screen**
   - **Android (Chrome):** menu ⋮ → **Install app** / **Add to Home screen**
5. It now behaves like a normal app icon. 🎉

(GitHub Pages or Vercel work the same way if you prefer those.)

### Option B — Same Wi-Fi as your PC (no hosting)
1. Run `python -m http.server 8080` on your PC (see above).
2. Find your PC's local IP (`ipconfig` → IPv4 Address, e.g. `192.168.1.20`).
3. On your phone (same Wi-Fi) open `http://192.168.1.20:8080`.
   - Note: notifications need HTTPS, so Option A is better if you want reliable reminders.

---

## 🔔 About reminders

Turn them on in **Settings → Reminders**. They fire at each quest's reminder time while
the app is installed. Web notifications are best-effort in the background (especially on
iPhone) — for rock-solid alarms later, we can move to a true native app. For now, keeping
the app installed to your home screen gives the best results.

---

## 🗂️ Your data

- Stored locally in your browser under the key `questly.v1`.
- Back it up any time: **Settings → Export** (saves `questly-backup.json`).
- Restore or move to a new device: **Settings → Import**.
- Clearing your browser data / site data will erase it, so export occasionally.

---

## 🧩 Files

```
index.html            app shell / markup
css/styles.css        the whole design system (themes, motion, layout)
js/app.js             all logic (tasks, points, streaks, levels, rewards, reminders)
manifest.webmanifest  PWA metadata (name, icons, colors)
sw.js                 service worker (offline caching + notifications)
icons/                app icons
```

Want changes — different colors, more reward types, a parent/guardian view, cloud sync
across devices, or a true native app with lock-screen alarms? Just ask.
