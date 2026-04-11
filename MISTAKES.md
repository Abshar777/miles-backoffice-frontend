# Frontend Mistakes & Bug Tracker

A full track record of bugs, mistakes, fixes, and lessons learned during development.

---

## Template

```
### [YYYY-MM-DD] — Short title
**File(s):** `src/pages/Example.js`
**Type:** Bug / UI Issue / Logic Error / Performance / Regression
**Discovered:** How it was found (user report, testing, review)
**Problem:** What was wrong and why
**Fix:** What was changed to fix it
**Lesson:** What to avoid in the future
```

---

## Log

---

### [2026-04-07] — `onPageSizeChange is not a function` in ReinstateCenter
**File(s):** `src/pages/ReinstateCenter.js`
**Type:** Runtime Error
**Discovered:** User reported error on `/reinstate` page
**Problem:** `PaginationControls` requires `totalItems`, `pageSize`, and `onPageSizeChange` props. All three were missing — `pageSize` state, `totalItems` state, and `handlePageSizeChange` function were not passed.
**Fix:** Added `pageSize` and `totalItems` state variables, added `handlePageSizeChange` function, and passed all required props to `PaginationControls`.
**Lesson:** Always check required props for shared components before use. `PaginationControls` needs all three: `totalItems`, `pageSize`, `onPageSizeChange`.

---

### [2026-04-07] — `/reinstate` page not showing (auth race condition)
**File(s):** `src/pages/ReinstateCenter.js`
**Type:** Logic Error / Race Condition
**Discovered:** User reported `/reinstate` page not displaying at all
**Problem:** `useEffect` redirect ran when `user` was still `null` (auth still loading), causing immediate navigation away from the page before auth resolved.
**Fix:** Read `loading` from `useAuth()` and wrapped redirect logic: `if (!loading && user && user.role !== "admin")`. Added a loading spinner while auth resolves.
**Lesson:** Always check `loading` state from `useAuth()` before making redirect decisions. Never redirect based on `user === null` alone.

---

### [2026-04-07] — `base_amount` / `base_currency` not displaying in Reinstate modal
**File(s):** `src/pages/ReinstateCenter.js`
**Type:** UI Issue / Data Mapping
**Discovered:** User reported amount and currency showing wrong values
**Problem:** Component was reading `item.amount` and `item.currency` directly instead of preferring `item.base_amount` and `item.base_currency`.
**Fix:** Used `item.base_amount ?? item.amount` and `item.base_currency || item.currency` in both `displayFields` and `PreviewSummary`.
**Lesson:** Always prefer `base_amount`/`base_currency` over `amount`/`currency` for display — the base fields represent the original payment currency.

---

### [2026-04-07] — ReinstateCenter missing scrolling, wrong colors in carlton
**File(s):** `src/pages/ReinstateCenter.js`, `frontend(carlton)/src/pages/ReinstateCenter.js`
**Type:** UI Issue
**Discovered:** User reported no scrolling on tab content and wrong colors in carlton
**Problem:** Tab content area was not using flex column layout with `min-h-0`, so content overflowed the page without scrolling. Carlton was using dark theme colors instead of light theme.
**Fix:** Used `flex-1 min-h-0 overflow-y-auto` on the tab content container. Created a separate carlton `ReinstateCenter.js` with light theme: `bg-white`, `bg-slate-50`, `text-slate-800`, `#1FA21B` green accent.
**Lesson:** For scrollable flex children, always set `min-h-0` otherwise `flex-1` doesn't constrain height. Carlton always uses light theme — write separate component files rather than conditional theming.

---

### [2026-04-10] — `outstanding_balance_usd` missing from loan response
**File(s):** `src/pages/BorrowerDetail.js`
**Type:** Data Mapping / Missing Field
**Discovered:** USD sub-line in BorrowerDetail outstanding column was showing `$0 USD` for non-USD loans
**Problem:** Frontend was reading `loan.outstanding_balance` (native currency amount) as the USD equivalent. Backend was not sending `outstanding_balance_usd` field.
**Fix:** Backend now computes and returns `outstanding_balance_usd` via `convert_to_usd()`. Frontend reads `loan.outstanding_balance_usd` for the USD sub-line and computes native outstanding locally: `Math.max(0, amount + total_interest - total_repaid)`.
**Lesson:** When displaying multi-currency values, always have backend send both native and USD amounts as separate fields. Never reuse native amount as USD equivalent.

---

### [2026-04-10] — Borrowers table missing Payment Currency column
**File(s):** `src/pages/Loans.js`
**Type:** Missing Feature / Data
**Discovered:** User could not see which currencies a borrower's loans were in
**Problem:** Backend `get_vendor_borrowers` was not tracking currencies used per vendor. Frontend had no `Payment Currency` column.
**Fix:** Backend collects `currencies` as a `set()` per vendor, returns as `sorted()` list. Frontend renders purple badges for each currency in a new `Payment Currency` column. Header renamed from `Disbursed` to `Disbursed (USD)` for clarity.
**Lesson:** When aggregating multi-currency data, always collect and expose the set of currencies used — don't assume USD only.

---
