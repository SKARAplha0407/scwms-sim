# Implementation Plan - Vulnerability Remediation

## Goal
Rectify 10 critical vulnerabilities identified in `security_audit_report.md` to secure the SanchaarGrid application.

## Proposed Changes

### 1. Database & DoS Protection (Vector 2)
#### [MODIFY] [db.ts](file:///Users/shreyaskumarrai/Desktop/NETWOK_SHREYAS/scwms-sim/src/lib/db.ts)
- Implement `CappedArray` class or logic to limit `store.telemetry` and `store.audit_logs` to 1000 items.
- Prevent "Infinite Memory" crash.

### 2. Authentication System (Vector 1)
#### [MODIFY] [models.ts](file:///Users/shreyaskumarrai/Desktop/NETWOK_SHREYAS/scwms-sim/src/lib/models.ts)
- Add `SessionModel` to manage active sessions on the server.

#### [NEW] [src/app/api/auth/login/route.ts](file:///Users/shreyaskumarrai/Desktop/NETWOK_SHREYAS/scwms-sim/src/app/api/auth/login/route.ts)
- Server-side login validation.
- Returns a secure session token (HTTP-only cookie or signed token - for this mock, a UUID token).

#### [NEW] [src/app/api/auth/me/route.ts](file:///Users/shreyaskumarrai/Desktop/NETWOK_SHREYAS/scwms-sim/src/app/api/auth/me/route.ts)
- Validate session token.
- Return current user role.

#### [MODIFY] [AuthContext.tsx](file:///Users/shreyaskumarrai/Desktop/NETWOK_SHREYAS/scwms-sim/src/contexts/AuthContext.tsx)
- Replace `sessionStorage` logic with API calls to `/api/auth/*`.
- Validate session on mount via `/api/auth/me`.

### 3. API Integrity & Safety (Vector 4)
#### [MODIFY] [src/app/api/policy/apply/route.ts](file:///Users/shreyaskumarrai/Desktop/NETWOK_SHREYAS/scwms-sim/src/app/api/policy/apply/route.ts)
- Add input validation (ensure `config` is valid JSON and not too large).
- Handle circular references safely.

#### [MODIFY] [src/app/api/simulate/devices/route.ts](file:///Users/shreyaskumarrai/Desktop/NETWOK_SHREYAS/scwms-sim/src/app/api/simulate/devices/route.ts)
- Validate `bandwidth_kbps` is a number.
- Sanitize inputs.

#### [MODIFY] [models.ts](file:///Users/shreyaskumarrai/Desktop/NETWOK_SHREYAS/scwms-sim/src/lib/models.ts)
- Add `Mutex` (using `Promise` locking) to `CriticalEventModel.setActive` to prevent race conditions.

### 4. UI/UX Fixes (Vectors 3, 5)
#### [MODIFY] [SessionTimer.tsx](file:///Users/shreyaskumarrai/Desktop/NETWOK_SHREYAS/scwms-sim/src/components/SessionTimer.tsx)
- Use `Date.now()` delta for accurate timing.

#### [MODIFY] [LayoutContent.tsx](file:///Users/shreyaskumarrai/Desktop/NETWOK_SHREYAS/scwms-sim/src/components/LayoutContent.tsx)
- Fix responsive breakpoint logic to handle 1023px correctly.

#### [MODIFY] [NetworkOverview.tsx](file:///Users/shreyaskumarrai/Desktop/NETWOK_SHREYAS/scwms-sim/src/components/dashboard/NetworkOverview.tsx)
- Add "Simulation Mode" badge.
- Add safe math checks for telemetry data.

#### [MODIFY] [src/app/layout.tsx](file:///Users/shreyaskumarrai/Desktop/NETWOK_SHREYAS/scwms-sim/src/app/layout.tsx)
- Add `suppressHydrationWarning` to `html` tag.
- (Optional) Add script to prevent FOUC.

## Verification Plan
- **Auth**: Try to inject `scwms_role` and refresh. Should fail.
- **DoS**: Run the loop script. Memory should stay stable.
- **Type**: Send "high" bandwidth. Dashboard should not crash.
- **Timer**: Check timer accuracy.
