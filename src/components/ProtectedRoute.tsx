'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

type UserRole = 'admin' | 'faculty' | 'student';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole: UserRole;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { isAuthenticated, userRole } = useAuth();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Check authentication
        if (!isAuthenticated || userRole !== requiredRole) {
            router.push('/');
        } else {
            setIsChecking(false);
        }
    }, [isAuthenticated, userRole, requiredRole, router]);

    // Show loading state while checking authentication
    if (isChecking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-text-secondary">Verifying access...</p>
                </div>
            </div>
        );
    }

    // Only render children if authenticated with correct role
    return <>{children}</>;
}
