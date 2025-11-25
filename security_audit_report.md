# 🚨 SECURITY AUDIT REPORT: SanchaarGrid (SCWMS)

**Auditor Role:** Senior QA Engineer & Security Auditor
**Target:** Next.js 16 / In-Memory Mock DB / Pusher
**Date:** 2025-11-26

---

## 💀 Top 10 Most Critical Vulnerabilities

### 1. The "Open Door" Auth Bypass (Critical)
*   **Vector:** 1 (Auth Bypass)
*   **Target File:** `src/contexts/AuthContext.tsx`
*   **The Exploit:** The application relies **entirely** on client-side `sessionStorage` for authentication state without verifying a token against the backend.
*   **Steps to Reproduce:**
    1. Open the browser DevTools (F12) on the login page.
    2. Run `sessionStorage.setItem('scwms_auth', 'true')` and `sessionStorage.setItem('scwms_role', 'admin')`.
    3. Refresh the page.
*   **Result:** You are instantly logged in as an Admin, bypassing the login form and password check entirely. `ProtectedRoute` only checks this storage key.
*   **Impact:** Total system compromise.

### 2. Privilege Escalation via Storage Mutation (Critical)
*   **Vector:** 1 (Auth Bypass)
*   **Target File:** `src/contexts/AuthContext.tsx`
*   **The Exploit:** Role-based access control (RBAC) is trusted from the client-side storage.
*   **Steps to Reproduce:**
    1. Login legitimately as a `student`.
    2. Open DevTools and change `scwms_role` from `student` to `admin`.
    3. Refresh the page.
*   **Result:** The UI now renders the Sidebar with Admin links (`/admin/policy`, `/admin/audit`), and `ProtectedRoute` allows access to these routes.
*   **Impact:** Unauthorized access to critical administrative functions.

### 3. The "Infinite Memory" DoS (Critical)
*   **Vector:** 2 (Chaos Monkey)
*   **Target File:** `src/lib/db.ts`
*   **The Exploit:** The in-memory database uses a simple array `store.telemetry` that never cleans up old data.
*   **Steps to Reproduce:**
    1. Write a script to POST to `/api/simulate/devices` with `deviceCount: 50` in a loop 10,000 times.
    2. Watch the server memory usage.
*   **Result:** The `store.telemetry` array grows indefinitely. Since Node.js has a default heap limit, the application will crash with `FATAL ERROR: Ineffective mark-compacts near heap limit Allocation failed - JavaScript heap out of memory`.
*   **Impact:** Server crash (Denial of Service).

### 4. Payload Poisoning & Event Loop Blocking (High)
*   **Vector:** 4 (API Integrity)
*   **Target File:** `src/lib/models.ts` & `src/app/api/policy/apply/route.ts`
*   **The Exploit:** The `PolicyModel.create` method uses `JSON.stringify()` on the config object synchronously.
*   **Steps to Reproduce:**
    1. Send a POST request to `/api/policy/apply` with a 4MB JSON object as the `config`.
*   **Result:** While `JSON.stringify` runs on this large object, the Node.js event loop is blocked. No other requests can be processed during this time.
*   **Impact:** Temporary Denial of Service and high latency for all users.

### 5. Type Confusion & Dashboard Crash (High)
*   **Vector:** 4 (API Integrity)
*   **Target File:** `src/components/dashboard/NetworkOverview.tsx`
*   **The Exploit:** The Telemetry API accepts string values for `bandwidth_kbps` (e.g., "high"), and the frontend performs unsafe math.
*   **Steps to Reproduce:**
    1. Send a POST to `/api/simulate/devices` injecting `{ bandwidth_kbps: "high" }`.
    2. Open the Dashboard.
*   **Result:** The calculation `acc + (curr.bandwidth_kbps || 0)` results in string concatenation (`"0high"`). Subsequent math `Math.round(totalBw / 1024)` results in `NaN`. The Recharts library or the stats display will likely render `NaN` or crash the React component tree.
*   **Impact:** Dashboard becomes unusable/broken.

### 6. Critical Event Race Condition (Medium)
*   **Vector:** 4 (API Integrity)
*   **Target File:** `src/lib/models.ts` (`CriticalEventModel.setActive`)
*   **The Exploit:** The `setActive` function performs a two-step operation (UPDATE then INSERT) without a transaction or mutex.
*   **Steps to Reproduce:**
    1. Fire two requests to apply "EXAM_MODE" and "LOCKDOWN_MODE" at the exact same millisecond.
*   **Result:** Both requests might execute the "UPDATE (clear all)" step first, and then both execute the "INSERT" step. The database ends up with *two* active critical events, violating the single-active-event logic.
*   **Impact:** Undefined system behavior and conflicting policies.

### 7. The "Time Travel" Drift (Medium)
*   **Vector:** 5 (Time Travel)
*   **Target File:** `src/components/SessionTimer.tsx`
*   **The Exploit:** The timer uses `setInterval` to subtract 1 second from a local state, rather than comparing `Date.now()` to a start time.
*   **Steps to Reproduce:**
    1. Open the dashboard and switch to a different browser tab for 30 minutes.
    2. Return to the tab.
*   **Result:** Browsers throttle `setInterval` in background tabs. The "Time Remaining" will have only decreased by ~30 seconds instead of 30 minutes.
*   **Impact:** User confusion and potential security risk (false sense of session time).

### 8. Theme "Flicker" & Hydration Mismatch (Low)
*   **Vector:** 3 (UI/UX)
*   **Target File:** `src/contexts/ThemeContext.tsx`
*   **The Exploit:** Theme is applied only in `useEffect` (client-side).
*   **Steps to Reproduce:**
    1. Set system preference to Dark Mode.
    2. Refresh the page.
*   **Result:** The server returns HTML with no theme class (Light mode). The screen flashes white for a split second before the `useEffect` runs and adds `data-theme="dark"`.
*   **Impact:** Poor user experience (visual glitch).

### 9. Responsive Layout Obstruction (Low)
*   **Vector:** 3 (UI/UX)
*   **Target File:** `src/components/LayoutContent.tsx`
*   **The Exploit:** The sidebar logic relies on `lg:` (1024px) utility classes for margins, but allows the sidebar to be open on smaller screens via state.
*   **Steps to Reproduce:**
    1. Resize viewport to 1023px.
    2. Click the "Menu" button to open the sidebar.
*   **Result:** The sidebar opens (width 260px), but the main content *does not* shift right (because `lg:ml-[260px]` only applies at 1024px+). The sidebar covers the left side of the dashboard content.
*   **Impact:** Content becomes inaccessible/hidden behind the sidebar.

### 10. The "Fake Data" Mask (Low)
*   **Vector:** 3 (UI/UX)
*   **Target File:** `src/components/dashboard/NetworkOverview.tsx`
*   **The Exploit:** The dashboard initializes with `generateDummyData()` and falls back to simulation if the API fails or returns empty data.
*   **Steps to Reproduce:**
    1. Shut down the backend or cause the API to 500.
    2. Refresh the dashboard.
*   **Result:** The user sees a beautiful, live-updating chart with realistic data. They have *no idea* the system is actually down or disconnected.
*   **Impact:** Misleading operational status; Admin might think everything is fine while the network is actually burning.

---

## 📊 Vulnerability Ranking

| Rank | Vulnerability | Likelihood to Crash Demo | Likelihood to Annoy User |
| :--- | :--- | :--- | :--- |
| 1 | **Auth Bypass** | **High** (Breaks Security Demo) | Low (User loves easy login) |
| 2 | **DoS (Memory Leak)** | **High** (Server Crash) | High (Service Unavailable) |
| 3 | **Payload DoS** | **High** (Server Hang) | High (Slow/Timeout) |
| 4 | **Type Confusion** | **High** (Dashboard Crash) | High (Broken UI) |
| 5 | **Privilege Escalation** | Medium | Low |
| 6 | **Race Condition** | Low | Medium (Confusing State) |
| 7 | **Timer Drift** | Low | **High** (Confusing Time) |
| 8 | **Fake Data Masking** | Low | Medium (Misleading) |
| 9 | **Theme Flicker** | Low | Medium (Visual Glitch) |
| 10 | **UI Obstruction** | Low | Low (Edge Case) |

---

### 🛡️ Summary
The SanchaarGrid application is **highly vulnerable** in its current state. The lack of server-side authentication validation (Vector 1) is the most critical flaw, rendering all other security measures moot. The in-memory database (Vector 2) is a ticking time bomb for memory leaks. Immediate remediation is required for the AuthContext and Database implementation before any production deployment.
