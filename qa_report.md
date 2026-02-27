# QA Report — 1% Daily
**Date:** 2026-02-27  
**Tester:** Antigravity QA Agent  
**Build:** Phase 1 MVP  
**File:** `index.html` (3803 lines, single-file app)

---

## 🔴 V0 Bugs (Launch Blockers — Must Fix Before Sharing)

| # | Screen | Bug Description | Likely Cause | Fix Hint | Status |
|---|--------|----------------|--------------|----------|--------|
| 1 | 4 (Home) | **Header settings gear icon does nothing.** The gear SVG button in the `<header>` at line 192 has no `onclick` or `addEventListener`. Tapping it does nothing. Users will expect it to open settings. | Missing event binding. The nav bar settings button works (line 1622), but the header gear icon is a separate element with no handler. | Add `onclick="App.openSettingsScreen()"` to the header `<button>` at line 192, or add an `id` and wire it in `setupAppEvents()`. | ✅ FIXED |
| 2 | 4 (Home) | **`user.streakCount` is always 0.** The dashboard shows `Streak: 0 days` because `this.data.user.streakCount` (line 3677) is never incremented anywhere in the code. `handleCheckInAction` updates per-habit `streakCurrent` but never touches `user.streakCount`. | The global user streak is initialized to 0 (line 1225) and never updated. | Either compute it live from habits (e.g. max of `habit.streakCurrent`) or increment `user.streakCount` in `handleCheckInAction` when **all** habits for the day are completed. | ✅ FIXED |
| 3 | 3 (Add Habit) | **No day buttons selected = habit runs every day (silently).** If user saves a habit without selecting any days, `h.frequency` is `[]`. `openPlanTomorrow` line 2160 treats `frequency.length === 0` as "every day". This is logical but **the user gets zero visual feedback** that "no days selected" means "every single day". | Empty frequency array is a valid edge case, but the UX is confusing — the form shows no days highlighted yet the habit appears every day. | Either auto-select all 7 days visually when none are selected (making the default explicit), or show a helper text "No days selected = runs every day". | ✅ FIXED |
| 4 | 6 (Celebration) | **`openHabitCelebration` crashes if `habit` is null.** Line 1885 accesses `habit.name` without a null check. If `this.currentCheckInHabitId` somehow references a deleted/missing habit, this line throws. | No guard before `habit.name` access. `handleCheckInAction` does have a `habit` lookup but doesn't guard the celebration call chain. | Add `if (!habit) return;` at the top of `openHabitCelebration()`. | ✅ FIXED |

---

## 🟡 V1 Bugs (Important — Fix in First Week After Launch)

| # | Screen | Bug Description | Likely Cause | Fix Hint | Status |
|---|--------|----------------|--------------|----------|--------|
| 5 | 8 (Plan) | **`openPlanTomorrow` `classList.replace()` fails silently on first load.** Lines 2154-2155 call `classList.replace('text-text', 'text-[#9CA3AF]')` and `classList.replace('border-accent', 'border-[#333]')`. On first open, the button already has `text-[#9CA3AF]` and `border-[#333]`, so `replace()` returns `false` and does nothing. Not a crash, but if state gets out of sync, the button styling may be wrong. | `classList.replace` returns false silently when the class to remove doesn't exist. | Use `classList.remove()` + `classList.add()` for robustness instead of `replace`. | ✅ FIXED |
| 6 | 12 (Weekly Review) | **`toast-review-saved` is positioned inside the scrollable content area.** The toast div (line 1031) is `fixed` positioned but is a child of the screen-weekly-review's scrollable content div, not `<body>`. On some mobile browsers, `fixed` inside a scrollable/transformed ancestor may not behave as true fixed positioning. | `position: fixed` elements inside a scrollable container with transform or overflow can be clipped or mispositioned. | Move the toast element outside `screen-weekly-review` into `<body>`, or create it dynamically like other toasts in the app. | ✅ FIXED |
| 7 | 13 (New Week) | **"Hardest Day" shows "Check Review" placeholder.** Line 3303 sets `nw-hardest-day` to the literal string `"Check Review"` instead of computing the actual hardest day. | The developer left a TODO/placeholder. The calculation logic exists in `openWeeklyReviewScreen` but wasn't ported to `openNewWeekScreen`. | Port the `dayCounts` calculation from `openWeeklyReviewScreen` to compute the actual hardest day. | ✅ FIXED |
| 8 | 13 (New Week) | **"Improvement" always shows "Consistent Daily".** Line 3298 hardcodes `nw-improvement` to `"Consistent Daily"` regardless of actual data. | Placeholder value, never replaced with actual computation. | Calculate the actual week-over-week improvement percentage and display it. | ✅ FIXED |
| 9 | 9 (Review) | **`closeReviewScreen` always navigates to Home tab.** Line 2378 calls `updateNavTabs('home')`. If user opened review via the Review nav tab, pressing back should return to the Review tab state (highlighted), not Home. | Hardcoded `'home'` in `closeReviewScreen`. | Track the origin tab (like `_settingsOriginTab`) or check the current nav state before overriding. | ✅ FIXED |
| 10 | 10 (Goals) | **"adjust" link on each goal card does nothing.** Line 2672 shows an `<span>` with text "adjust" but it has no `onclick` handler. | Missing handler — the span is purely decorative. | Either add an `onclick` to expand/collapse the target picker, or remove the "adjust" text to avoid confusion. | ✅ FIXED |
| 11 | 14 (Settings) | **Editing a habit shows "Coming soon!" toast.** The edit pencil icon (line 3500) calls `showComingSoonToast()`. Users will expect to be able to edit habit names/details. | Feature not implemented, placeholder toast used. | For launch, either hide the edit icon entirely or implement inline editing. | ✅ FIXED |
| 12 | 3 (Add Habit) | **`saveNewHabit(true)` doesn't reset the identity area dropdown.** When "Add Another" is clicked, `form.reset()` is called (line 2730), but the identity dropdown was dynamically populated by `showOnboardingStep2()`. `form.reset()` sets `<select>` back to the first `<option>` (the disabled "Select area" placeholder), which is correct visually, but if the user skipped the dropdown before, it defaults to `'General'` (line 1690) — not their selected identity area from Step 1. | The `category` fallback is `'General'` even if the user chose specific areas in Step 1. | Auto-select the first identity area from `user.identityAreas` as the default, or require it with validation. | ✅ FIXED |

---

## 🟢 V2 Polish (Nice to Have — Fix in Phase 2)

| # | Screen | Issue | Recommendation |
|---|--------|-------|----------------|
| 13 | 3 (Add Habit) | `nh-name` and other input fields have empty `placeholder=""`. User sees no hint text about what to type. | Add placeholder text like `"e.g. Morning Run"`, `"e.g. Just 1 pushup"`, `"e.g. After brushing teeth"`. |
| 14 | 1 (Splash) | The 1.5-second auto-routing timer (`splashTimeout`) fires even if the user hasn't finished reading the splash screen. On slow devices, the fade-in animation may not complete before the timeout triggers. | Increase to 2.5s, or wait for animation completion before starting the timer. |
| 15 | 4 (Home) | No empty state for "THIS WEEK'S PROGRESS" section. If user has habits but none match their `identityAreas`, the section renders empty with no message. | Add a "No category progress yet" message when `catContainer` has no children. |
| 16 | All screens | Toasts created dynamically via `document.body.appendChild()` are appended outside `#app-container`, so on desktop they appear at the left edge of the viewport, not centered in the 375px phone frame. | Append toasts to `#app-container` instead of `document.body`, or scope the `fixed` positioning within the container. |
| 17 | 8 (Plan) | The "2x more likely" insight card is hardcoded static text with no data basis. | Fine for MVP, but in Phase 2 consider showing actual plan-vs-no-plan completion rates. |
| 18 | 5 (Check-in) | Typing a non-numeric value in "Log today's number" (e.g. "good") won't crash, but the celebration screen's comparison logic (`parseFloat`) will silently fail and show no diff. | Add `type="number"` or show a subtle hint that numeric values enable tracking. |
| 19 | 9 (Review) | Screen has `z-40` while all other overlay screens have `z-50` or higher. If another screen with `z-50` is accidentally left visible, it would cover the review screen. | Change to `z-50` for consistency, or document why it's intentionally lower. |
| 20 | 14 (Settings) | The "Claim Reward" checkmark icon on each reward row (line 3606) calls `openRewardScreen(habitId)` without `weekStart`, which defaults to current week. If user clicks this icon for a habit that hasn't met its target, the reward screen shows with 0 completions. | Add a guard check: only show the claim icon if the habit's weekly target is met. |

---

## ✅ Screens That Pass QA

| Screen | Status | Notes |
|--------|--------|-------|
| 1 — Splash | ✅ Pass | Renders correctly, button works, auto-routing works. |
| 2 — Onboarding Step 1 | ✅ Pass | Goal cards toggle, Continue button enables/disables, custom goal creation works, back button works. |
| 7 — Today's Summary | ✅ Pass | All sections render with real data, logged improvements show diffs, streaks display, weekly progress segments render, buttons work. |
| 11 — Goal Hit / Claim Reward | ✅ Pass | Reward text, emoji detection, wins list, confetti animation, claim/later buttons all work. Back button works. |

---

## Launch Readiness Score

### **10 / 10**

**Verdict: Ship it.** All V0 and V1 bugs are fixed. Only V2 polish items remain — none affect core functionality or daily use.
