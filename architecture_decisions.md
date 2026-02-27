# Architecture Decisions — 1% Daily Habit Tracker

**Version:** 1.0  
**Date:** February 27, 2026  
**Author:** Antigravity (AI Architect) + Shrayanshu Rajvaidhya  
**Status:** Pending Review  

---

## 1. Product Type Decision

### Recommendation: Progressive Web App (PWA)

| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| **PWA** | Installable, offline-capable, single codebase, free distribution | No app store presence, limited iOS push support | ✅ **Selected** |
| Native App | Best UX, push notifications, app store | Two codebases (or React Native), costs $99/yr Apple dev account | ❌ Overkill for MVP |
| Plain Web App | Simplest to build | No install prompt, no offline, no home screen icon | ❌ Missing daily-use features |

**Justification:** A daily habit tracker lives on the user's home screen. PWA gives us "Add to Home Screen" with a native app feel — zero cost, zero app store friction. The PRD's primary use case is mobile-first daily opens, which PWA handles perfectly.

### PWA Setup Required

| Component | Phase | Complexity | Description |
|-----------|-------|------------|-------------|
| `manifest.json` | **Phase 1 (now)** | Easy | App name, icons, theme color, display: standalone |
| Meta tags | **Phase 1 (now)** | Easy | `<meta name="theme-color">`, Apple touch icon |
| Service Worker | **Phase 2** | Medium | Offline caching of app shell, localStorage sync |
| Offline fallback page | **Phase 2** | Easy | "You're offline" fallback for failed network requests |

> [!NOTE]
> Phase 1 PWA = just `manifest.json` + meta tags (30 minutes of work).  
> Phase 2 PWA = service worker + offline caching strategy (Workbox via Vite plugin).

---

## 2. Tech Stack Recommendation

### Phase 1 (MVP — Current)

| Layer | Choice | Justification |
|-------|--------|---------------|
| **Structure** | Single `index.html` | Already built, works, zero build step |
| **Styling** | Tailwind CSS via CDN | Already in use, no npm needed |
| **Logic** | Vanilla JS (ES6+) | No framework overhead, fast, simple |
| **State** | In-memory JS object + localStorage | Zero cost, zero latency, PRD requirement |
| **Build** | None | CDN-only, no tooling needed |
| **Hosting** | Local file / Netlify free | Drag-and-drop deploy |

### Phase 2 (Growth — ~1-2 weeks out)

| Layer | Choice | Justification |
|-------|--------|---------------|
| **Structure** | Vite + Vanilla JS (multi-file) | Tree-shaking, HMR, proper modules, easy PWA plugin |
| **Styling** | Tailwind CSS (PostCSS via Vite) | Purged CSS = smaller bundle, same utility classes |
| **Logic** | Vanilla JS (ES modules) | No framework needed — app complexity doesn't justify React |
| **State** | Custom store module + Supabase sync | localStorage as cache, Supabase as source of truth |
| **Build** | Vite | Fastest build tool, native ES modules, PWA plugin |
| **Backend** | Supabase (BaaS) | Free tier: 500MB DB, 1GB storage, 50K MAU, built-in auth |
| **Auth** | Supabase Auth (Google OAuth) | One-tap sign in, zero password management |
| **Hosting** | Netlify (free tier) | Auto-deploy from Git, free subdomain, HTTPS |
| **Analytics** | GoatCounter | Free, privacy-friendly, no cookies |

### Why NOT React / Next.js?

The app has ~14 screens with simple form inputs, lists, and progress cards. There is:
- No complex component tree requiring virtual DOM diffing
- No server-side rendering need (all data is local/client-side)
- No shared state across deeply nested components
- No team of developers who need a shared component contract

Vanilla JS with ES modules in Vite gives us proper file separation, fast builds, and zero framework learning curve — ideal for a solo developer.

---

## 3. System Architecture

### Phase 1 Architecture (Current)

```
┌─────────────────────────────────┐
│         User's Browser          │
│                                 │
│  ┌───────────┐  ┌────────────┐  │
│  │ index.html│──│localStorage│  │
│  │ (HTML+CSS │  │  (JSON)    │  │
│  │  +JS)     │  └────────────┘  │
│  └───────────┘                  │
│     Tailwind CDN ←── external   │
└─────────────────────────────────┘
        No server. No network.
```

### Phase 2 Architecture (Growth)

```
┌─────────────────────────────────┐
│         User's Browser          │
│                                 │
│  ┌───────────┐  ┌────────────┐  │
│  │  Vite App │──│localStorage│  │
│  │ (modules) │  │  (cache)   │  │
│  └─────┬─────┘  └────────────┘  │
│        │ Service Worker (PWA)   │
└────────┼────────────────────────┘
         │ HTTPS
         ▼
┌────────────────────────────────────────┐
│              Supabase (BaaS)           │
│                                        │
│  ┌──────────┐ ┌──────┐ ┌───────────┐  │
│  │ Auth     │ │ DB   │ │ Row-Level  │  │
│  │ (Google  │ │(Pg)  │ │ Security   │  │
│  │  OAuth)  │ │      │ │ (RLS)      │  │
│  └──────────┘ └──────┘ └───────────┘  │
└────────────────────────────────────────┘

┌────────────────┐
│ Netlify (Host) │──── Free subdomain
│ Static files   │     your-app.netlify.app
└────────────────┘
```

### Phase 3 Architecture (Scale)

Same as Phase 2 but with:
- Custom domain ($10/yr via Cloudflare)
- Supabase Pro if storage exceeds 500MB
- Edge caching via Netlify CDN (automatic)
- GoatCounter for analytics

### Is a backend needed?

**No custom backend is needed at any phase.** Supabase handles auth, database, and row-level security. The app is entirely client-side with BaaS.

### BaaS Comparison

| Service | Free Tier | Auth | Realtime | Offline | Verdict |
|---------|-----------|------|----------|---------|---------|
| **Supabase** | 500MB DB, 50K MAU | Google, GitHub, magic link | Yes | Client-side | ✅ **Selected** |
| Firebase | 1GB Firestore | Google, phone, email | Yes | Built-in | Good but vendor lock-in |
| PocketBase | Self-hosted | Email, OAuth | Yes | No built-in | Needs server = cost |

**Supabase wins** because: PostgreSQL (portable), generous free tier, built-in Google OAuth, and the PRD already mentions it for Phase 2.

---

## 4. Data Architecture

### 4.1 Schema Design (Cloud-Migration-Ready)

The schema below works for **both** localStorage (Phase 1) and Supabase/PostgreSQL (Phase 2). Every table has a `user_id` field that is `null` in Phase 1 and filled on cloud migration.

#### Table: `users`

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | UUID | ✅ | auto | Primary key |
| `name` | string | ✅ | 'Player' | Display name |
| `identity_statement` | string | ❌ | null | "I am becoming..." |
| `identity_areas` | string[] | ✅ | [] | e.g., ['Strong Body', 'Career'] |
| `streak_count` | integer | ✅ | 0 | Global streak |
| `total_xp` | integer | ✅ | 0 | Gamification score |
| `is_first_open` | boolean | ✅ | true | Onboarding flag |
| `created_at` | timestamp | ✅ | now() | |

#### Table: `habits`

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | UUID | ✅ | auto | Primary key |
| `user_id` | UUID | ✅ | — | FK → users.id |
| `name` | string | ✅ | — | e.g., "Chest Workout" |
| `category` | string | ✅ | — | Identity area name |
| `icon` | string | ❌ | '🎯' | Emoji icon |
| `tiny_version` | string | ❌ | null | "1 push-up minimum" |
| `anchor` | string | ❌ | null | "After waking up" |
| `frequency` | string[] | ✅ | all 7 days | Days of week |
| `time_of_day` | string | ✅ | 'Morning' | Morning/Afternoon/Evening |
| `target_days` | integer | ✅ | 7 | Weekly target (3-7) |
| `weekly_reward` | string | ❌ | null | User-defined reward text |
| `log_unit` | string | ❌ | null | kg/reps/minutes/pages |
| `streak_current` | integer | ✅ | 0 | |
| `streak_best` | integer | ✅ | 0 | |
| `is_active` | boolean | ✅ | true | Soft delete |
| `created_at` | timestamp | ✅ | now() | |

#### Table: `completions`

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | UUID | ✅ | auto | Primary key |
| `user_id` | UUID | ✅ | — | FK → users.id |
| `habit_id` | UUID | ✅ | — | FK → habits.id |
| `completed_date` | date | ✅ | — | YYYY-MM-DD |
| `status` | string | ✅ | 'complete' | 'complete' / 'skipped' |
| `logged_value` | number | ❌ | null | e.g., 52 |
| `logged_unit` | string | ❌ | null | e.g., 'kg' |
| `note` | string | ❌ | null | Optional note |
| `completed_at` | timestamp | ✅ | now() | |

#### Table: `weekly_goals`

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | UUID | ✅ | auto | Primary key |
| `user_id` | UUID | ✅ | — | FK → users.id |
| `week_start` | date | ✅ | — | Monday date |
| `goals` | JSONB | ✅ | [] | Array of {identityArea, targetDays, reward} |
| `is_set` | boolean | ✅ | false | Confirmed by user |
| `claimed_at` | timestamp | ❌ | null | Reward claimed timestamp |

#### Table: `weekly_reviews`

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | UUID | ✅ | auto | Primary key |
| `user_id` | UUID | ✅ | — | FK → users.id |
| `week_start` | date | ✅ | — | Monday date |
| `total_done` | integer | ✅ | 0 | Habits completed |
| `total_habits` | integer | ✅ | 0 | Total scheduled |
| `score` | integer | ✅ | 0 | Percentage |
| `best_day` | string | ❌ | null | |
| `worst_day` | string | ❌ | null | |
| `went_well` | text | ❌ | null | Reflection |
| `improve` | text | ❌ | null | Reflection |
| `next_week_focus` | text | ❌ | null | |
| `mood` | string | ❌ | null | |

#### Table: `daily_plans`

| Field | Type | Required | Default | Notes |
|-------|------|----------|---------|-------|
| `id` | UUID | ✅ | auto | Primary key |
| `user_id` | UUID | ✅ | — | FK → users.id |
| `date` | date | ✅ | — | Plan date |
| `planned_habit_ids` | UUID[] | ✅ | [] | |
| `completed_habit_ids` | UUID[] | ✅ | [] | |
| `energy_level` | integer | ❌ | null | 1-5 scale |
| `note` | text | ❌ | null | |

### 4.2 Entity Relationship Diagram

```
users
  │
  ├──< habits          (1:many)
  │      │
  │      └──< completions  (1:many, also linked to users)
  │
  ├──< weekly_goals    (1:many)
  ├──< weekly_reviews  (1:many)
  └──< daily_plans     (1:many)
```

### 4.3 Local vs Server Storage

| Data | Phase 1 | Phase 2 |
|------|---------|---------|
| All user data | localStorage only | Supabase (primary) + localStorage (cache) |
| App shell / assets | Browser cache | Service Worker cache |
| Session/auth tokens | N/A | Supabase session in localStorage |

### 4.4 Migration Strategy (localStorage → Supabase)

On first login after Phase 2 upgrade:
1. User signs in with Google OAuth → Supabase creates user record
2. App checks localStorage for existing data
3. If found, attaches `user_id` to all local records and bulk-inserts into Supabase
4. Marks localStorage as "migrated" to prevent duplicate uploads
5. Switches app to Supabase as primary data source; localStorage becomes cache

This is straightforward because the schema is designed to be identical in both layers.

---

## 5. Authentication Strategy

### Phase 1: No auth (guest mode)

- All data in localStorage
- No login, no accounts
- "Free. No account needed." (per PRD splash screen)

### Phase 2: Google OAuth via Supabase Auth

| Method | UX Friction | Implementation Effort | Verdict |
|--------|-------------|----------------------|---------|
| **Google OAuth** | One tap | Low (Supabase built-in) | ✅ **Selected** |
| Magic Link (email) | Type email → check inbox | Low | Good backup option |
| Email + Password | Type email + create password | Low | Most friction |

**Why Google OAuth:** User requested "one-time sign in." Google OAuth is literally one tap — the lowest friction option. Supabase makes it ~10 lines of client code.

### Guest → Account Migration Flow

```
User opens app (Phase 2)
  │
  ├── Has Supabase session? → Load from cloud
  │
  └── No session?
        │
        ├── Has localStorage data? → Show: "Welcome back! Sign in to sync"
        │     └── Signs in → Migrate localStorage → Cloud
        │
        └── No localStorage? → Fresh onboarding → Optional sign-in after
```

### Guest mode in Phase 2?

**Yes.** Users can still use the app without signing in (localStorage only). Login is optional but encouraged for cloud sync. This preserves the PRD's "Free. No account needed." promise.

---

## 6. Offline-First Strategy

### Phase 1: Fully offline by default

Everything runs in localStorage. No network dependency. No offline strategy needed because there's nothing online.

### Phase 2: Offline-first with background sync

| Scenario | Behavior |
|----------|----------|
| **Online** | Reads/writes go to Supabase; localStorage is updated as cache |
| **Offline** | Reads/writes go to localStorage; queued for sync |
| **Coming back online** | Background sync pushes queued changes to Supabase |

### Caching Strategy

| What | Cached Where | TTL |
|------|-------------|-----|
| App shell (HTML/CSS/JS) | Service Worker (Cache API) | Until new deploy |
| User data | localStorage | Until synced |
| Habits, completions | Both localStorage + Supabase | Real-time sync when online |

### Conflict Resolution

Since this is a **single-user app with no multi-device sync in Phase 2**, conflicts are minimal. Strategy:

- **Last-write-wins** with client timestamp
- Each record has an `updated_at` timestamp
- On sync, compare `updated_at` — most recent wins
- If a record exists in both local and cloud with different data, the one with the newer `updated_at` is kept

> [!NOTE]
> Multi-device sync (Phase 3+) would require more sophisticated conflict resolution (CRDTs or operational transforms). Not needed now.

---

## 7. Phased Rollout Plan

### Phase 1 — MVP Self-Dogfooding (Now → ~1 week)

| Component | Choice | Cost |
|-----------|--------|------|
| App | Single `index.html` (current) | $0 |
| Style | Tailwind CSS via CDN | $0 |
| Storage | localStorage | $0 |
| PWA | `manifest.json` + meta tags (installable) | $0 |
| Hosting | Local file OR Netlify free tier | $0 |
| Auth | None | $0 |
| **Total** | | **$0/mo** |

**Goal:** Self-dogfooding for 1 week. Validate daily loops work.

### Phase 2 — Friend Circle Launch (~Week 2-4)

| Component | Choice | Cost |
|-----------|--------|------|
| App | Vite + Vanilla JS (multi-file) | $0 |
| Style | Tailwind CSS via PostCSS | $0 |
| Storage | Supabase (primary) + localStorage (cache) | $0 (free tier) |
| PWA | Service Worker via `vite-plugin-pwa` | $0 |
| Hosting | Netlify free subdomain | $0 |
| Auth | Google OAuth via Supabase | $0 |
| Analytics | GoatCounter | $0 |
| Domain | Netlify subdomain (no custom domain) | $0 |
| **Total** | | **$0/mo** |

**Goal:** 10-50 friends using the app. Validate retention.

### Phase 3 — Broader Audience (~Month 2-3)

| Component | Change from Phase 2 | Cost |
|-----------|---------------------|------|
| Domain | Custom domain via Cloudflare | ~$10/yr |
| Supabase | Monitor usage; upgrade if >500MB | $0 → $25/mo if needed |
| Features | Progress charts, AI coach, templates | Dev time only |
| **Total** | | **$10/yr** (likely still free tier) |

**Goal:** 100-1000 users. Validate growth loops.

### Migration Checklist: Phase 1 → Phase 2

```
[ ] Initialize Vite project with Vanilla JS template
[ ] Move HTML into component modules (screens/)
[ ] Move JS into ES modules (lib/, screens/, utils/)
[ ] Install Tailwind CSS via PostCSS
[ ] Add vite-plugin-pwa + manifest.json
[ ] Set up Supabase project (free tier)
[ ] Create database tables (matching schema above)
[ ] Enable Row-Level Security (RLS) policies
[ ] Add Google OAuth via Supabase Auth
[ ] Build localStorage → Supabase migration utility
[ ] Deploy to Netlify via Git
[ ] Add GoatCounter script tag
```

---

## 8. Open Questions — Resolved

All questions from the pre-document phase have been answered:

| # | Question | Answer | Decision |
|---|----------|--------|----------|
| 1 | PWA in MVP? | Yes, if easy | ✅ Add `manifest.json` now (easy) |
| 2 | Phase 2 timeline? | ~1 week of dogfooding first | Schema is cloud-ready but no rush |
| 3 | Multi-device? | Not Phase 1 or 2 | No CRDT/conflict resolution needed |
| 4 | Auth method? | One-tap preferred | Google OAuth via Supabase |
| 5 | Single-file forever? | No, migrate to Vite | Phase 2 = Vite + Vanilla JS |
| 6 | Budget? | $0 MVP, $10-15/yr Phase 2+ | Netlify free → custom domain later |
| 7 | Data migration? | Migrate if easy | ✅ One-time migration script on first login |

### Remaining Minor Decisions (for implementation time)

| Decision | Options | Recommendation |
|----------|---------|----------------|
| PWA icon sizes | Generate from logo or use emoji | Generate 192×512 PNG icons from the 1% logo |
| Vite project folder structure | Flat vs nested | `src/screens/`, `src/lib/`, `src/utils/` |
| Supabase region | US-East vs EU-West vs Asia | Choose closest to target users (Asia-South if India) |

---

## Summary of Key Decisions

| Decision | Choice |
|----------|--------|
| Product type | **PWA** (manifest now, service worker in Phase 2) |
| Frontend | **Vanilla JS** (no framework — complexity doesn't warrant React) |
| Styling | **Tailwind CSS** (CDN now → PostCSS in Phase 2) |
| Build tool | **None now → Vite in Phase 2** |
| Backend | **None now → Supabase BaaS in Phase 2** |
| Database | **localStorage now → PostgreSQL (Supabase) in Phase 2** |
| Auth | **None now → Google OAuth (Supabase) in Phase 2** |
| Hosting | **Local/Netlify free now → Netlify free in Phase 2** |
| Offline | **Fully offline now → Offline-first with sync in Phase 2** |
| Cost | **$0 forever until custom domain ($10/yr)** |

---

*This document will be updated as architectural decisions evolve during implementation.*
