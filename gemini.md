# Project Constitution: 1% Daily

## 🟢 B.L.A.S.T. Protocol Overrides
This project is a FRONTEND WEB APP.
- **Stack:** HTML + CSS + JS (all in `index.html`)
- **Styling:** Tailwind CSS via CDN (NO npm, NO build step)
- **Logic:** Vanilla JavaScript ES6+
- **Storage:** `localStorage` ONLY (NO database)
- **Architecture:** No backend, No login, No external APIs
- **Design:** Mobile-first (375px width)

## 🎨 Design System
- **Background:** `#0D0D0D`
- **Cards:** `#1A1A1A`
- **Accent teal:** `#00C9A7`
- **Purple:** `#A78BFA`
- **Amber:** `#FBBF24`
- **Green:** `#22C55E`
- **Text:** `#F5F5F5`
- **Muted text:** `#9CA3AF`
- **Font:** Inter from Google Fonts CDN
- **Border radius:** 16px cards, 50px buttons
- **Spacing:** 8px grid

## 🗄️ Data Schema (localStorage)
The JSON shapes are defined below. These are the core starting point based on Blueprint approval:
- `user`: `{ name, identityStatement, streakCount, totalXP }`
- `habits[]`: `{ id, name, category, icon, color, frequency, targetDays, streakCurrent, streakBest, isActive, createdAt }`
- `completions[]`: `{ id, habitId, completedDate, note }`
- `weeklyGoals[]`: `{ id, weekStart, goals[], reflection, completedCount, totalCount }`
- `weeklyReviews[]`: `{ id, weekStart, wentWell, improve, nextWeekFocus, mood }`
- `dailyPlans[]`: `{ id, date, plannedHabitIds[], completedHabitIds[], energyLevel, note }`
