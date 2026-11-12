# Momentum — Design Reference

Source: [Figma — Design Implementation](https://www.figma.com/design/T9GprshW58rdhC3oWP8cb2/Design-Implementation)

This document captures the structure and visual language of the Figma file for the Smart Task Management Assistant ("Momentum"), for reference when implementing the UI. It is a design reference only — it does not define backend behavior.

## Pages in the Figma file

| Page | Purpose |
|---|---|
| 00 · Start here | Index/landing frame linking into the rest of the file |
| 01 · Design system | Tokens, components, and their states |
| 02 · Account access | Login, registration, password reset flows (user + admin) |
| 03 · User workspace | Core product screens (dashboard, tasks, search, create) |
| 04 · Administration | Admin console (system + user management) |
| 05 · States & dialogs | Confirmations, toasts, empty/loading/error states, filters |
| 06 · Responsive | Laptop / tablet / mobile (390px) variants |
| 07 · Connected prototype | All flows wired together for click-through |

## Brand & visual language

- **Product name:** Momentum — "Less juggling. More progress."
- **Tagline:** "A considered workspace for personal tasks, AI planning and system administration."
- **Typeface:** Inter, with a defined scale: hero / h1 / h2 / h3 / body / small
- **Logo mark:** a diamond (◈) glyph next to the wordmark "momentum"

### Color palette

| Token | Hex | Usage |
|---|---|---|
| Action | `#4F46D9` | Primary buttons, links, active nav state (indigo) |
| Progress | `#0E766E` | Progress bars, completed-task charts (teal) |
| Urgent | `#B4233A` | Urgent/overdue badges, destructive actions |
| Warning | `#956000` | Warning badges/notices |
| Text | `#192238` | Primary body text |
| Surface | `#FFFFFF` | Base surface/background |

Dark navy (`~#1C2438`-ish) is used for the landing hero and the admin console shell; light gray/white is used for the authenticated user workspace.

### Spacing & radius

- Spacing scale: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64
- Radius scale: 4 / 8 / 12 (+ pill/full for buttons and badges)

## Component library (page 01)

- **Button** — styles: Primary, Secondary, Danger, Ghost; states: Default, Hover, Focus, Loading, Disabled
- **Field** — states: Default, Focus, Error, Disabled, Password, Search, Dropdown, Date, Time, Multiselect
- **Badge** — priority (Urgent, High, Normal, Low, Not Urgent) and status (Pending, Completed, Overdue, Active, Blocked, Inactive, Operational, Warning, Unavailable, Draft)
- **Toggle, Checkbox, Radio** — on/off states
- **Notice** — Info, Success, Error, Warning
- **Chat bubble** — Role: User, Assistant (for the AI assistant surface)
- **Skeleton, Tooltip, Icon button, Pagination, Calendar cell, Modal, Task card, Notification, Empty state, Progress circle**
- **Navigation item** — Role: User / Admin, each with Default, Active, Hover, Focus
- **Icon set (24px stroke):** dashboard, tasks, calendar, assistant, plans, drafts, notifications, reports, profile, settings, logout, search, eye, users, status

## Core flows

### 1. Account access (page 02)
Shared two-column layout: left "brand story" panel (logo, tagline, hero copy, a live product-preview card), right "account form" panel. Duplicated for **user** and **admin** contexts:

- `login` → `forgot` → `email-sent` → `reset` → `reset-success` / `reset-expired`
- `register` → `register-validation` (inline field errors) → `registered`
- Admin mirror: `admin-login`, `admin-forgot`, `admin-email-sent`, `admin-reset`, `admin-reset-success`, `admin-reset-expired`

### 2. User workspace (page 03)
Persistent left sidebar nav: Dashboard, Tasks, Calendar, AI Assistant, AI Plans, Drafts, Notifications, Reports, Profile, Settings, Log out.

- `dashboard` — greeting header, 6 metric tiles (Total/Pending/Completed/Overdue/Upcoming/High priority), a weekly completion bar chart, a "your week in motion" progress summary with an "Ask AI to plan my day" CTA, and an upcoming-tasks list.
- `tasks` — searchable/filterable list view of tasks with summary rows.
- `search` — search-results variant of the tasks view.
- `task-grid` — card-grid alternative layout for tasks.
- `create-task` — task creation form.

### 3. Administration (page 04)
Dark sidebar nav: Dashboard, Users, User Statistics, Task Statistics, Activity Statistics, Notification Statistics, Auto-Draft Statistics, System Status, Admin Profile, Settings.

- `admin-dashboard` ("System overview") — 8 aggregate metric tiles (registered/active/blocked users, total tasks, completed, pending, notifications, auto-drafts), two weekly bar charts (user growth, task completion), and a system-health notice.
- `admin-users` / `admin-user-search` / `admin-user-filtered` — registered-users table with search and filters.
- `admin-user-detail` / `admin-user-blocked` — single managed-account view with account metadata and actions.
- `admin-user-stats` / `admin-task-stats` — deeper analytics screens.

### 4. States & dialogs (page 05)
An exhaustive catalog (~90 frames) to design against, including:

- **Confirmations:** delete task/plan/account, logout (user/admin), block/unblock/remove user, discard unsaved changes, disable/enable auto-draft, clear history, AI action confirmations
- **Success toasts:** task created/saved/deleted, profile updated, plan saved/deleted, draft converted/dismissed, notification dismissed, password changed, report ready/downloaded, account deleted, logged out
- **Empty states:** no tasks, no search results, no plans, no drafts, no notifications, no reports, no matching accounts
- **Loading states:** tasks loading, searching, users loading, AI thinking, plan building, PDF generating, signing in, deleting account
- **Error states:** login/admin-login failed, account blocked/inactive, AI unavailable/clarify, plan/report/task/profile save failed, reminder/status errors, session expired
- **Overlays:** filter/sort/priority/category pickers, date picker, reminder config, change-password forms, chat tooltip, account menu panels, notification panel

### 5. Responsive (page 06)
Mobile (390px) versions of the core flows with a bottom tab bar (Home / Tasks / AI / Calendar): `mobile-dashboard`, `mobile-tasks`, `mobile-create`, `mobile-task-detail`, `mobile-assistant`, `mobile-plan`, `mobile-calendar`. Laptop/tablet breakpoints reuse the same desktop layouts at reduced widths.

### 6. Connected prototype (page 07)
All of the above wired together with real click-through navigation — useful as the reference for end-to-end interaction flow, not for new visual content.

## Implementation notes

- Design uses **sample data only**; AI responses, account changes, and PDF downloads are simulated in the prototype.
- Treat page 01 (Design system) as the source of truth for reusable components — build these first, then compose the page-level screens from them.
- User-facing (light) and Admin-facing (dark) shells share the same structural pattern (sidebar + top bar + page content) but differ in theme — consider a single shell layout with a theme/role variant rather than two separate implementations.
