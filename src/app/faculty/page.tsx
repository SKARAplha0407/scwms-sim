'use client';

import { CheckCircle, Shield, LogOut } from 'lucide-react';
import SessionTimer from '@/components/SessionTimer';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/contexts/AuthContext';

export default function FacultyPage() {
    const router = useRouter();
    const { logout } = useAuth();

    return (
        <ProtectedRoute requiredRole="faculty">
            <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-800/50"></div>
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-info/10 rounded-full blur-3xl"></div>

                <div className="w-full max-w-md relative z-10">
                    <div className="glass rounded-2xl p-8 text-center animate-in zoom-in-95 duration-500 shadow-xl border border-white/20">
                        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <CheckCircle className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                        </div>

                        <h1 className="text-2xl font-bold text-text-primary mb-2">Login Successful</h1>
                        <p className="text-text-secondary text-lg mb-6 font-medium">Welcome to the network.</p>

                        <div className="bg-surface-hover rounded-xl p-4 border border-border">
                            <div className="flex items-center justify-center gap-2 text-primary mb-1">
                                <Shield className="w-4 h-4" />
                                <span className="font-bold text-sm">Access Granted</span>
                            </div>
                            <p className="text-text-secondary text-sm">
                                Access has been granted to this computer for <span className="font-bold text-text-primary">24 hours</span>.
                            </p>
                        </div>

                        <SessionTimer durationMs={24 * 60 * 60 * 1000} />

                        <button
                            onClick={logout}
                            className="mt-6 flex items-center justify-center gap-2 w-full py-2 text-text-secondary hover:text-danger transition-colors text-sm font-medium group"
                        >
                            <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
