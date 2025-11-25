'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, Pause, Play } from 'lucide-react';

export default function SimulationController() {
    const [active, setActive] = useState(true);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!active) return;

        const interval = setInterval(async () => {
            try {
                const res = await fetch('/api/simulate/devices', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deviceCount: 20 }),
                });
                if (res.ok) {
                    setCount(c => c + 1);
                }
            } catch (e) {
                console.error('Sim loop error', e);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [active]);

    return (
        <div
            className="fixed bottom-6 right-6 z-50 card-modern p-4"
            style={{
                minWidth: '280px',
                maxWidth: '320px'
            }}
        >
            {/* Header with Icon */}
            <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: '1px solid var(--color-divider)' }}>
                <div className="icon-container primary">
                    <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        Simulation Engine
                    </h3>
                    <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Real-time data generation</p>
                </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between mb-3 pb-3" style={{ borderBottom: '1px solid var(--color-divider)' }}>
                <div className="flex items-center gap-2">
                    <span className={`status-badge ${active ? 'status-healthy' : 'status-danger'}`}>
                        {active ? 'ACTIVE' : 'PAUSED'}
                    </span>
                </div>
                <div className="px-3 py-1 rounded-md" style={{ background: 'var(--color-surface-hover)' }}>
                    <span className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                        {count} cycles
                    </span>
                </div>
            </div>

            {/* Control Button */}
            <button
                onClick={() => setActive(!active)}
                className={`w-full btn-modern ${active ? 'btn-primary' : 'btn-success'}`}
            >
                <span className="flex items-center justify-center gap-2">
                    {active ? (
                        <>
                            <Pause className="w-4 h-4" />
                            <span>Pause</span>
                        </>
                    ) : (
                        <>
                            <Play className="w-4 h-4" />
                            <span>Resume</span>
                        </>
                    )}
                </span>
            </button>

            {/* Info */}
            {active && (
                <div className="mt-3 pt-3 text-xs" style={{ borderTop: '1px solid var(--color-divider)' }}>
                    <div className="flex justify-between mb-1">
                        <span style={{ color: 'var(--color-text-secondary)' }}>Interval:</span>
                        <span style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>3 seconds</span>
                    </div>
                    <div className="flex justify-between">
                        <span style={{ color: 'var(--color-text-secondary)' }}>Devices:</span>
                        <span style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>20</span>
                    </div>
                </div>
            )}
        </div>
    );
}
