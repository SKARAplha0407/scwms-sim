'use client';

import { useState } from 'react';
import { Wifi } from 'lucide-react';

export default function GuestPortal() {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const res = await fetch('/api/guest/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            if (res.ok) {
                setStatus('success');
            } else {
                setStatus('error');
            }
        } catch (err) {
            setStatus('error');
        }
    };

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
                <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <Wifi className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Connected!</h1>
                    <p className="text-gray-600">
                        You now have guest access to the Smart Campus WiFi network.
                    </p>
                    <div className="p-4 bg-gray-50 rounded-lg text-sm text-gray-500">
                        Session expires in 24 hours.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Wifi className="w-6 h-6 text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Guest WiFi Access</h1>
                    <p className="text-gray-600 mt-2">Enter your email to connect to the campus network.</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <input
                            type="email"
                            id="email"
                            required
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="visitor@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {status === 'loading' ? 'Connecting...' : 'Connect'}
                    </button>
                </form>

                <div className="text-center text-xs text-gray-400">
                    By connecting, you agree to the Acceptable Use Policy.
                </div>
            </div>
        </div>
    );
}
