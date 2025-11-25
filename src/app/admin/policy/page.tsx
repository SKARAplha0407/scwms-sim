'use client';

import { useState } from 'react';
import { Shield, Check, AlertTriangle } from 'lucide-react';

export default function PolicyPage() {
    const [loading, setLoading] = useState(false);
    const [lastResult, setLastResult] = useState<any>(null);

    const applyPolicy = async (name: string, config: any) => {
        setLoading(true);
        try {
            const res = await fetch('/api/policy/apply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, config }),
            });
            const data = await res.json();
            setLastResult(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="card-modern p-6">
                <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Policy Management</h1>
                <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>Configure QoS and Traffic Prioritization.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Policy Controls */}
                <div className="card-modern p-6">
                    <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--color-text-primary)' }}>
                        <Shield className="w-5 h-5" style={{ color: 'var(--color-primary)' }} /> Standard Policies
                    </h3>
                    <div className="space-y-3">
                        <button
                            onClick={() => applyPolicy('ACADEMIC_PRIORITY', { academic: 'High', social: 'Low', video: 'Medium' })}
                            disabled={loading}
                            className="w-full p-4 text-left card-modern card-modern-interactive flex justify-between items-center"
                        >
                            <div>
                                <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Academic Priority</div>
                                <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>Prioritize LMS, Library, and Research traffic.</div>
                            </div>
                            {loading && <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)' }} />}
                        </button>

                        <button
                            onClick={() => applyPolicy('EXAM_MODE', { academic: 'Critical', social: 'Block', video: 'Block' })}
                            disabled={loading}
                            className="w-full p-4 text-left card-modern card-modern-interactive flex justify-between items-center"
                            style={{ borderColor: 'var(--color-danger)' }}
                        >
                            <div>
                                <div className="font-semibold" style={{ color: 'var(--color-danger)' }}>Exam Mode (Critical)</div>
                                <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>Strictly block non-essential traffic.</div>
                            </div>
                            <AlertTriangle className="w-5 h-5" style={{ color: 'var(--color-danger)' }} />
                        </button>

                        <button
                            onClick={() => applyPolicy('EVENT_MODE', { academic: 'Medium', social: 'High', video: 'High' })}
                            disabled={loading}
                            className="w-full p-4 text-left card-modern card-modern-interactive flex justify-between items-center"
                        >
                            <div>
                                <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Event / Guest Mode</div>
                                <div className="text-xs mt-1" style={{ color: 'var(--color-text-secondary)' }}>Relax restrictions for campus events.</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Simulation Output */}
                <div className="card-modern p-6" style={{ minHeight: '300px' }}>
                    <h3 className="mb-4 uppercase text-xs tracking-wider font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Simulated Controller Output</h3>
                    {lastResult ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2" style={{ color: 'var(--color-success)' }}>
                                <Check className="w-4 h-4" /> 
                                <span className="font-semibold">Policy Applied Successfully</span>
                            </div>
                            <div style={{ color: 'var(--color-text-primary)' }}>
                                <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Command:</span> {lastResult.simulated_controller_command}
                            </div>
                            <div style={{ color: 'var(--color-text-primary)' }}>
                                <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Config:</span>
                                <pre className="mt-2 text-xs p-3 rounded-lg card-modern" style={{ 
                                    background: 'var(--color-surface-hover)',
                                    color: 'var(--color-text-primary)',
                                    fontFamily: 'var(--font-mono)'
                                }}>
                                    {JSON.stringify(lastResult.policy.config, null, 2)}
                                </pre>
                            </div>
                            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--color-divider)', color: 'var(--color-text-secondary)', fontSize: '0.75rem' }}>
                                Timestamp: {new Date().toISOString()}
                            </div>
                        </div>
                    ) : (
                        <div className="italic" style={{ color: 'var(--color-text-secondary)' }}>
                            Waiting for command...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
