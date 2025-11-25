# SanchaarGrid: Smart Campus WiFi Management System

## Abstract

SanchaarGrid is a comprehensive network management system designed for educational campus environments. The system implements real-time traffic monitoring, policy-based bandwidth allocation, and role-based access control to optimize network resource utilization across diverse user groups.

This implementation serves as a demonstration platform for Software Development Laboratory coursework, showcasing full-stack web development, authentication systems, database management, and real-time data visualization techniques.

---

## System Architecture

### Technology Stack

**Frontend:**
- Next.js 16.0.3 (React 19.2.0)
- TypeScript 5
- Tailwind CSS 4
- Recharts 3.4.1 for data visualization
- Pusher-js 8.4.0 for WebSocket communication

**Backend:**
- Next.js API Routes (serverless)
- In-memory mock database with mutex-based concurrency control
- Pusher 5.2.0 for real-time event broadcasting

**Security:**
- Server-side session validation
- Token-based authentication (UUID)
- Input validation and sanitization
- Cache-Control headers for authenticated routes
- Promise-based mutex for data integrity

---

## Core Components

### 1. Authentication System

**Implementation:** `src/contexts/AuthContext.tsx`, `src/app/api/auth/`

The authentication layer implements server-side session validation rather than client-side token trust. Key features:

- Session tokens generated via `randomUUID()` on successful login
- Tokens validated against server-side session store on every protected route access
- Support for three user roles: Admin, Faculty, Student
- Session expiration after 24 hours
- Automatic session cleanup on logout using `router.replace()` to prevent browser cache retention

**Protected Routes:** `src/components/ProtectedRoute.tsx` enforces role-based access control by validating session state before rendering protected content.

---

### 2. Network Simulation Engine

**Implementation:** `src/lib/simulation-engine.ts`, `src/app/api/simulate/devices/route.ts`

Generates realistic network telemetry data simulating campus WiFi infrastructure:

- **Device Telemetry**: Bandwidth (kbps), active connections, CPU/memory usage
- **Traffic Classification**: Categorizes traffic into Academic, Video, Social, Other based on URL patterns
- **Academic Hours Logic**: Adjusts traffic patterns between 9:00-17:00 to reflect daytime usage
- **Critical Events**: Supports special modes (e.g., EXAM_MODE) that alter bandwidth allocation

The simulation runs on a 3-second interval via `SimulationController.tsx` and broadcasts updates through Pusher WebSocket channels.

---

### 3. Real-Time Dashboard

**Implementation:** `src/components/dashboard/NetworkOverview.tsx`

Displays live network metrics using Recharts library:

- **Line Chart**: 30-minute rolling bandwidth usage history
- **Pie Chart**: Traffic distribution by category (Academic, Labs, GH, BH-1/2/3/4)
- **Statistics Cards**: Total bandwidth, active devices, average latency
- **Simulation Mode Indicator**: Warns when displaying synthetic data vs. real telemetry

Data updates occur via:
1. Polling (`fetch('/api/telemetry')` every 10 seconds)
2. Pusher WebSocket events (sub-second latency for real-time updates)

---

### 4. Policy Management

**Implementation:** `src/app/api/policy/apply/route.ts`

Administrators can configure network policies that affect traffic prioritization:

**Available Policies:**
- `EXAM_MODE`:
- `ACADEMIC_HOURS`: 
- `NORMAL`:

Each policy application:
- Validates input size (100KB limit) and detects circular JSON references
- Stores configuration in mock database
- Creates audit log entry
- Broadcasts change via Pusher to all connected clients
- Updates `CriticalEventModel` to reflect system-wide state

---

### 5. Mock Database with Concurrency Control

**Implementation:** `src/lib/db.ts`

The system uses an in-memory store optimized for serverless deployment:

**Data Collections:**
- `telemetry`: Network device metrics (capped at 1000 items via FIFO eviction)
- `sessions`: Active user sessions
- `policies`: Applied network configurations
- `audit_logs`: Administrative actions
- `critical_events`: System-wide state flags

**Concurrency Protection:**
- Promise-based mutex (`withLock()`) serializes all database operations
- Prevents race conditions on concurrent read/write operations
- Ensures data integrity without external database ACID guarantees

---

## Security Hardening

The application underwent comprehensive security auditing and remediation:

### Vulnerabilities Addressed

1. **Authentication Bypass**: Implemented server-side token validation instead of trusting client storage
2. **Privilege Escalation**: Role enforcement via session lookup rather than `sessionStorage` mutation
3. **DoS (Memory Leak)**: Capped collection sizes with FIFO eviction policy
4. **Payload Poisoning**: JSON size limits (100KB) and circular reference detection
5. **Type Confusion**: Strict type validation on all API endpoints
6. **Race Conditions**: Mutex locks on critical sections (DB operations, critical events)
7. **Timer Drift**: Date.now() delta calculation instead of interval accumulation
8. **Cache Persistence**: Cache-Control headers and router.replace() on logout
9. **Layout Issues**: Responsive margin calculation fixes
10. **Data Transparency**: Simulation mode indicators when displaying synthetic data

**Security Audit Reports:**
- `security_audit_report.md`: Initial vulnerability assessment
- `post_remediation_audit.md`: Verification testing results
- `final_security_audit.md`: Production readiness certification

---

## File Structure

```
scwms-sim/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API endpoints
│   │   │   ├── auth/           # Authentication routes
│   │   │   ├── simulate/       # Telemetry generation
│   │   │   ├── telemetry/      # Data retrieval
│   │   │   └── policy/         # Policy management
│   │   ├── admin/              # Admin dashboard
│   │   ├── faculty/            # Faculty portal
│   │   ├── student/            # Student portal
│   │   └── page.tsx            # Login page
│   ├── components/             # React components
│   │   ├── dashboard/          # Dashboard widgets
│   │   ├── ProtectedRoute.tsx  # Authorization wrapper
│   │   ├── LayoutContent.tsx   # Main layout
│   │   └── SimulationController.tsx
│   ├── contexts/               # React Context providers
│   │   ├── AuthContext.tsx     # Authentication state
│   │   └── ThemeContext.tsx    # Light/dark mode
│   ├── lib/                    # Core logic
│   │   ├── db.ts               # Mock database
│   │   ├── models.ts           # Data models
│   │   ├── simulation-engine.ts
│   │   └── pusher.ts           # WebSocket config
│   ├── hooks/                  # Custom React hooks
│   └── middleware.ts           # Cache-Control headers
├── public/                     # Static assets
├── __tests__/                  # Jest test suites
└── package.json
```

---

## Installation and Setup

### Prerequisites
- Node.js 18.17 or later
- npm package manager

### Steps

1. Clone repository
```bash
git clone <repository-url>
cd scwms-sim
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables (optional - Pusher is optional)
```bash
# .env.local
PUSHER_APP_ID=your_app_id
NEXT_PUBLIC_PUSHER_KEY=your_key
PUSHER_SECRET=your_secret
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
```

4. Run development server
```bash
npm run dev
```

Access at `http://localhost:3000`

### Default Login Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin |
| Faculty | faculty | faculty |
| Student | student | student |

---

## Testing

Run test suite:
```bash
npm test
```

Build verification:
```bash
npm run build
```

---

## Deployment

The application is configured for serverless deployment on Vercel:

1. Push code to Git repository
2. Import project to Vercel
3. Configure environment variables
4. Deploy

**Production Checklist:**
- Replace mock database with PostgreSQL/MongoDB
- Implement rate limiting
- Add CSRF protection
- Enable HTTPS enforcement
- Configure Content Security Policy headers
- Implement password hashing (bcrypt)

---

## Key Learnings

This project demonstrates:

1. **Full-Stack Development**: Integration of frontend React components with Next.js API routes
2. **Authentication Architecture**: Server-side session management vs. client-side token storage
3. **Real-Time Systems**: WebSocket communication for live data updates
4. **Database Design**: In-memory storage with concurrency control mechanisms
5. **Security Hardening**: Comprehensive vulnerability assessment and remediation
6. **State Management**: React Context API for global state (auth, theme)
7. **Type Safety**: TypeScript for compile-time error detection
8. **Testing**: Jest and React Testing Library for component validation
9. **Responsive Design**: Tailwind CSS for mobile-first UI development
10. **Performance Optimization**: Server-side rendering and code splitting

---

## Future Enhancements

1. Migration to persistent database (PostgreSQL)
2. Integration with physical network devices (SNMP/NetFlow)
3. Machine learning-based traffic prediction
4. Multi-campus support with federated authentication
5. Mobile application for network administrators
6. Advanced analytics with historical trend analysis

---

## References

- Next.js Documentation: https://nextjs.org/docs
- Pusher Channels: https://pusher.com/docs/channels
- Recharts Library: https://recharts.org
- OWASP Security Guidelines: https://owasp.org

---

## Project Information

**Course:** Software Development Lab
**Submitted By:** Shreyas Kumar Rai  
**Roll Number:** 23UCC601  
**Institution:** LNMIIT Jaipur  
**Academic Year:** 2025-2026
