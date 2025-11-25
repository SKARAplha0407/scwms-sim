import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { classifyTraffic, getSimulationState } from '@/lib/simulation-engine';
import SessionTimer from '@/components/SessionTimer';
import { POST as registerGuest } from '@/app/api/guest/register/route';
import { POST as applyPolicy } from '@/app/api/policy/apply/route';
import { pool } from '@/lib/db';
import LoginPage from '@/app/page';

// --- Mocks ---

// Mock Pusher to prevent connection errors
jest.mock('pusher-js', () => {
    return jest.fn().mockImplementation(() => {
        return {
            subscribe: jest.fn().mockReturnValue({
                bind: jest.fn(),
                unbind: jest.fn(),
            }),
            unsubscribe: jest.fn(),
            disconnect: jest.fn(),
        };
    });
});

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: jest.fn(),
        prefetch: jest.fn(),
    }),
}));

// Mock AuthContext
jest.mock('@/contexts/AuthContext', () => ({
    useAuth: () => ({
        login: jest.fn(),
        logout: jest.fn(),
        isAuthenticated: false,
        userRole: null,
    }),
}));


// Mock Next.js server response
jest.mock('next/server', () => ({
    NextResponse: {
        json: (body: any, init?: any) => {
            return {
                status: init?.status || 200,
                json: async () => body,
                text: async () => JSON.stringify(body),
            };
        },
    },
}));

// --- Test Suite ---

describe('SanchaarGrid Comprehensive Testing Strategy', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    // 1. Unit Testing
    describe('1. Unit Testing: Traffic Classification', () => {
        test('classifyTraffic correctly identifies domain categories', () => {
            expect(classifyTraffic('https://moodle.edu/course/view', 'student')).toBe('academic');
            expect(classifyTraffic('https://www.netflix.com/watch', 'student')).toBe('video');
            expect(classifyTraffic('https://twitter.com/home', 'student')).toBe('social');
            expect(classifyTraffic('https://unknown-site.com', 'student')).toBe('other');
        });
    });

    // 2. Component Testing
    describe('2. Component Testing: SessionTimer', () => {
        test('SessionTimer decrements time correctly', () => {
            const durationMs = 10000; // 10 seconds
            render(<SessionTimer durationMs={durationMs} />);

            // Initial state: 00:00:10
            expect(screen.getByText('00:00:10')).toBeInTheDocument();

            // Advance time by 1 second
            act(() => {
                jest.advanceTimersByTime(1000);
            });

            // Expected state: 00:00:09
            expect(screen.getByText('00:00:09')).toBeInTheDocument();
        });
    });

    // 3. Integration Testing
    describe('3. Integration Testing: Guest Registration API', () => {
        test('POST /api/guest/register adds user to database', async () => {
            const mockRequest = {
                json: async () => ({
                    name: 'John Doe',
                    email: 'john@example.com',
                    purpose: 'Visitor',
                    duration: 2,
                }),
            } as Request;

            const response = await registerGuest(mockRequest);
            const data = await response.json();

            expect(response.status).toBe(200);
            expect(data.success).toBe(true);
            expect(data.session).toBeDefined();

            // Verify DB persistence
            // Note: GuestSessionModel in models.ts might not have findOne, so we query directly via pool
            // and filter manually because the mock DB returns all rows for simple selects.
            if (!pool) throw new Error('Pool is not initialized');
            const [rows] = await pool.query('SELECT * FROM guest_sessions');
            const user = (rows as any[]).find((u: any) => u.email === 'john@example.com');

            expect(user).toBeDefined();
            expect(user?.email).toBe('john@example.com');
        });
    });

    // 4. System Testing
    describe('4. System Testing: Policy Application & State Change', () => {
        test('Applying EXAM_MODE policy updates system state', async () => {
            // 1. Verify initial state (assuming default is false)
            let state = await getSimulationState();
            // Reset state if needed (mock DB might persist across tests if not cleared)
            // For this test, we assume clean slate or we force it.

            // 2. Apply Policy
            const mockRequest = {
                json: async () => ({
                    name: 'EXAM_MODE',
                    config: { academic: 'Critical' }
                }),
            } as Request;

            const response = await applyPolicy(mockRequest);
            expect(response.status).toBe(200);

            // 3. Verify System State Change
            state = await getSimulationState();
            // Note: getSimulationState checks CriticalEventModel. 
            // The applyPolicy API should update CriticalEventModel for 'EXAM_MODE'.
            // We need to ensure applyPolicy logic actually sets a critical event active.
            // If the actual implementation of applyPolicy doesn't set CriticalEventModel, this test might fail 
            // and reveal a "bug" or mismatch in expectation, which is good for QA report.

            // Based on previous context, EXAM_MODE likely triggers a critical event.
            // Let's verify if 'criticalEventActive' becomes true.
            expect(state.criticalEventActive).toBe(true);
        });
    });

    // 5. UI / E2E Simulation
    describe('5. UI / E2E Simulation: Login Flow', () => {
        test('User can select portal, enter credentials, and login', async () => {
            render(<LoginPage />);

            // 1. Select User Type (Admin)
            const roleSelect = screen.getByRole('combobox');
            fireEvent.change(roleSelect, { target: { value: 'admin' } });

            // 2. Enter Username
            const usernameInput = screen.getByPlaceholderText('Enter your username');
            fireEvent.change(usernameInput, { target: { value: 'admin_user' } });

            // 3. Enter Password
            const passwordInput = screen.getByPlaceholderText('Enter your password');
            fireEvent.change(passwordInput, { target: { value: 'admin' } });

            // 3. Click Sign In
            const submitButton = screen.getByRole('button', { name: /Sign In/i });

            await act(async () => {
                fireEvent.click(submitButton);
                // Advance timers for the simulated network delay (800ms)
                jest.advanceTimersByTime(1000);
            });

            // 4. Verify Navigation
            // The LoginPage uses useAuth().login() then router.push('/admin')
            // We mocked useAuth, but the component calls it. 
            // We need to verify router.push was called.
            expect(mockPush).toHaveBeenCalledWith('/admin');
        });
    });

});
