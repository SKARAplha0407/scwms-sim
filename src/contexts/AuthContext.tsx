'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

type UserRole = 'admin' | 'faculty' | 'student' | null;

interface AuthContextType {
    isAuthenticated: boolean;
    userRole: UserRole;
    login: (role: UserRole) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_KEY = 'scwms_auth';
const ROLE_KEY = 'scwms_role';

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<UserRole>(null);
    const router = useRouter();

    // Check authentication on mount
    useEffect(() => {
        const auth = sessionStorage.getItem(AUTH_KEY);
        const role = sessionStorage.getItem(ROLE_KEY) as UserRole;

        if (auth === 'true' && role) {
            setIsAuthenticated(true);
            setUserRole(role);
        }
    }, []);

    const login = (role: UserRole) => {
        if (role) {
            sessionStorage.setItem(AUTH_KEY, 'true');
            sessionStorage.setItem(ROLE_KEY, role);
            setIsAuthenticated(true);
            setUserRole(role);
        }
    };

    const logout = () => {
        sessionStorage.removeItem(AUTH_KEY);
        sessionStorage.removeItem(ROLE_KEY);
        setIsAuthenticated(false);
        setUserRole(null);
        router.push('/');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout }}>
            {children}
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
