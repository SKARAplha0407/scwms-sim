'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, User, Shield, GraduationCap, BookOpen, Activity, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuth();
    const [role, setRole] = useState('');
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
            // Simple validation for simulation
            // In a real app, we'd send all 3 to the backend
            if (role === 'admin' && password === 'admin') {
                login('admin');
                router.push('/admin');
            } else if (role === 'faculty' && password === 'faculty') {
                login('faculty');
                router.push('/faculty');
            } else if (role === 'student' && password === 'student') {
                login('student');
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
                            <label className="block text-sm font-semibold text-text-secondary ml-1">User Type</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors group-focus-within:text-primary">
                                    <Shield className="h-5 w-5 text-text-tertiary group-focus-within:text-primary transition-colors" />
                                </div>
                                <select
                                    required
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="input-modern pl-11 h-12 bg-surface/50 focus:bg-surface border-transparent focus:border-primary/30 shadow-sm appearance-none w-full cursor-pointer"
                                >
                                    <option value="" disabled>Select User Type</option>
                                    <option value="admin">Admin</option>
                                    <option value="faculty">Faculty</option>
                                    <option value="student">Student</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

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
                </div>
            </div>
        </div>
    );
}

