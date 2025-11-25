'use client';

import { useEffect, useState } from 'react';
import { usePusher } from '@/hooks/usePusher';
import { Server } from 'lucide-react';

// Generate dummy devices for demo
const generateDummyDevices = (count = 20) => {
    return Array.from({ length: count }, (_, i) => ({
        device_id: `ap-${String(i + 1).padStart(2, '0')}`,
        bandwidth_kbps: Math.floor(Math.random() * 50000) + 10000,
        active_connections: Math.floor(Math.random() * 30) + 5,
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        traffic_class: ['academic', 'video', 'social', 'other'][Math.floor(Math.random() * 4)],
    }));
};

export default function DevicesPage() {
    const [devices, setDevices] = useState<any[]>([]);
    const [mounted, setMounted] = useState(false);

    // Load initial data
    useEffect(() => {
        setMounted(true);

        // Try to fetch from API first
        fetch('/api/telemetry')
            .then(res => res.json())
            .then(data => {
                if (data && data.length > 0) {
                    // Group by device_id and get latest for each
                    const latestByDevice = data.reduce((acc: any, curr: any) => {
                        if (!acc[curr.device_id] || new Date(curr.timestamp) > new Date(acc[curr.device_id].timestamp)) {
                            acc[curr.device_id] = curr;
                        }
                        return acc;
                    }, {});
                    setDevices(Object.values(latestByDevice));
                } else {
                    // Use dummy data if no real data
                    setDevices(generateDummyDevices(20));
                }
            })
            .catch(() => {
                // Fallback to dummy data on error
                setDevices(generateDummyDevices(20));
            });

        // Refresh every 5 seconds
        const interval = setInterval(() => {
            fetch('/api/telemetry')
                .then(res => res.json())
                .then(data => {
                    if (data && data.length > 0) {
                        const latestByDevice = data.reduce((acc: any, curr: any) => {
                            if (!acc[curr.device_id] || new Date(curr.timestamp) > new Date(acc[curr.device_id].timestamp)) {
                                acc[curr.device_id] = curr;
                            }
                            return acc;
                        }, {});
                        setDevices(Object.values(latestByDevice));
                    }
                })
                .catch(() => {
                    // Keep existing data on error
                });
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    // Subscribe to Pusher updates (if configured)
    usePusher('scwms-telemetry', 'update', (data: any[]) => {
        if (!mounted) return;
        setDevices(data);
    });

    if (!mounted) {
        return (
            <div className="space-y-6">
                <div className="card-modern p-6">
                    <h1 className="text-3xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Connected Devices</h1>
                    <p style={{ color: 'var(--color-text-secondary)' }} className="mt-2">Live status of network infrastructure</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="card-modern p-4 animate-pulse">
                            <div className="h-16 skeleton rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="card-modern p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold" style={{ color: 'var(--color-text-primary)' }}>Connected Devices</h1>
                        <p style={{ color: 'var(--color-text-secondary)' }} className="mt-2">Live status of network infrastructure</p>
                    </div>
                    <div className="status-badge status-info">
                        {devices.length} Active
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {devices.map((device) => (
                    <div key={device.device_id} className="card-modern card-modern-interactive p-4 flex items-center gap-4">
                        <div className="icon-container primary">
                            <Server className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{device.device_id}</h3>
                                <span className={`status-badge ${device.cpu > 80 ? 'status-danger' :
                                        device.cpu > 50 ? 'status-warning' :
                                            'status-healthy'
                                    }`}>
                                    {device.cpu > 80 ? 'High' : device.cpu > 50 ? 'Medium' : 'Healthy'}
                                </span>
                            </div>
                            <div className="text-xs space-y-1" style={{ color: 'var(--color-text-secondary)' }}>
                                <div className="flex justify-between">
                                    <span>Bandwidth:</span>
                                    <span className="font-medium">{Math.round(device.bandwidth_kbps / 1024)} Mbps</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Connections:</span>
                                    <span className="font-medium">{device.active_connections}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>CPU:</span>
                                    <span className="font-medium">{device.cpu}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
