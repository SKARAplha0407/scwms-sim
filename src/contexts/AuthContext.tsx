'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type UserRole = 'admin' | 'faculty' | 'student' | null;

interface AuthContextType {
    isAuthenticated: boolean;
    userRole: UserRole;
    login: (role: string, password?: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = 'scwms_auth';
const ROLE_KEY = 'scwms_role';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<UserRole>(null);
    const [loading, setLoading] = useState(true); // Add loading state
    const router = useRouter();

    // Check authentication on mount
    useEffect(() => {
        const validateSession = async () => {
            const token = sessionStorage.getItem(AUTH_KEY);
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch('/api/auth/me', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setIsAuthenticated(true);
                    setUserRole(data.role);
                } else {
                    // Invalid token
                    sessionStorage.removeItem(AUTH_KEY);
                    sessionStorage.removeItem(ROLE_KEY);
                }
            } catch (e) {
                console.error("Auth validation failed", e);
            } finally {
                setLoading(false);
            }
        };

        validateSession();
    }, []);

    const login = async (role: UserRole, password?: string) => {
        // We need password now. But the interface only has role.
        // We should update the interface or just accept that we need to change the call signature.
        // For now, I will assume the LoginPage will pass the password if I update the type.
        // But to avoid breaking changes in other components (if any), I'll handle it.
        // Wait, LoginPage calls login(role).
        // I need to update LoginPage too.
        throw new Error("Use loginWithCredentials instead");
    };

    const loginWithCredentials = async (role: string, password: string) => {
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role, password })
            });

            if (res.ok) {
                const data = await res.json();
                sessionStorage.setItem(AUTH_KEY, data.token);
                sessionStorage.setItem(ROLE_KEY, data.role);
                setIsAuthenticated(true);
                setUserRole(data.role as UserRole);
                return true;
            }
            return false;
        } catch (e) {
            return false;
        }
    };

    const logout = () => {
        sessionStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(ROLE_KEY);
        setIsAuthenticated(false);
        setUserRole(null);
        router.replace('/'); // Use replace to prevent back-button cache
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userRole, login: loginWithCredentials as any, logout }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
