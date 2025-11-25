'use client';

import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface SessionTimerProps {
    durationMs: number;
}

export default function SessionTimer({ durationMs }: SessionTimerProps) {
    const [timeLeft, setTimeLeft] = useState(durationMs);

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1000) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1000;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const pad = (n: number) => n.toString().padStart(2, '0');
        return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    };

    return (
        <div className="flex items-center justify-center gap-2 text-text-secondary font-mono text-sm bg-surface rounded-lg px-3 py-1.5 border border-border inline-flex mt-4">
            <Clock className="w-4 h-4 text-primary" />
            <span>Time Remaining: <span className="font-bold text-text-primary">{formatTime(timeLeft)}</span></span>
        </div>
    );
}
