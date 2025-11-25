'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, User, Shield, GraduationCap, BookOpen, Activity, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [shake, setShake] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate network delay
        setTimeout(() => {
            if (username === 'admin' && password === 'admin') {
                router.push('/admin');
            } else if (username === 'faculty' && password === 'faculty') {
                router.push('/faculty');
            } else if (username === 'student' && password === 'student') {
                router.push('/student');
            } else {
                setError('Invalid credentials. Please try again.');
                setShake(true);
                setLoading(false);
                setTimeout(() => setShake(false), 400);
            }
        }, 800);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-mesh p-4 relative overflow-hidden">
            <div className="w-full max-w-md relative z-10">
                {/* Logo / Header */}
                <div className="text-center mb-8 animate-in slide-in-from-top-4 duration-500">
                    <div className="w-20 h-20 bg-gradient-to-tr from-primary to-info rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary/20 ring-4 ring-white/20">
                        <Activity className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-text-primary tracking-tight mb-2">SanchaarGrid</h1>
                    <p className="text-text-secondary text-lg">Smart Campus WiFi Management</p>
                </div>

                {/* Login Card */}
                <div className={`glass rounded-3xl p-8 sm:p-10 animate-in zoom-in-95 duration-500 delay-150 relative overflow-hidden ${shake ? 'animate-shake' : ''}`}>
                    {/* Decorative gradient blob inside card */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

                    <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-text-secondary ml-1">Username</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                                    <User className="h-5 w-5 text-text-tertiary group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="input-modern pl-11 h-12 bg-surface/50 focus:bg-surface border-transparent focus:border-primary/30 shadow-sm"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-text-secondary ml-1">Password</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                                    <Lock className="h-5 w-5 text-text-tertiary group-focus-within:text-primary transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-modern pl-11 h-12 bg-surface/50 focus:bg-surface border-transparent focus:border-primary/30 shadow-sm"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm font-medium animate-in fade-in slide-in-from-top-2 flex items-center gap-3 shadow-lg shadow-danger/5">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary h-12 text-base font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 rounded-xl bg-gradient-to-r from-primary to-info hover:from-primary-hover hover:to-blue-600"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-divider">
                        <p className="text-center text-xs font-bold text-text-secondary uppercase tracking-wider mb-4">Available Portals</p>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-surface-hover transition-all cursor-help group border border-transparent hover:border-border">
                                <div className="p-2.5 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                                    <Shield className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-semibold text-text-secondary group-hover:text-text-primary">Admin</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-surface-hover transition-all cursor-help group border border-transparent hover:border-border">
                                <div className="p-2.5 rounded-lg bg-info/10 text-info group-hover:bg-info group-hover:text-white transition-colors duration-200">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-semibold text-text-secondary group-hover:text-text-primary">Faculty</span>
                            </div>
                            <div className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-surface-hover transition-all cursor-help group border border-transparent hover:border-border">
                                <div className="p-2.5 rounded-lg bg-success/10 text-success group-hover:bg-success group-hover:text-white transition-colors duration-200">
                                    <GraduationCap className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-semibold text-text-secondary group-hover:text-text-primary">Student</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

