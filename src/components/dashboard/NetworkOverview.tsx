'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePusher } from '@/hooks/usePusher';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, Wifi, Zap } from 'lucide-react';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#64748B'];

// Define proper types for your data
interface TelemetryItem {
    device_id: string;
    bandwidth_kbps: number;
    latency_ms?: number;
    traffic_class: string;
    timestamp: string;
}

interface ChartData {
    time: string;
    bandwidth: number;
    timestamp: number;
}

interface TrafficDistribution {
    name: string;
    value: number;
    [key: string]: any; // Index signature for Recharts compatibility
}

interface Stats {
    totalBandwidth: number;
    activeDevices: number;
    avgLatency: number;
}

// Generate dummy data for initial display
// Generate dummy data for initial display
const generateDummyData = (): ChartData[] => {
    const now = new Date();
    const data: ChartData[] = [];
    for (let i = 10; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 1000);
        data.push({
            time: timestamp.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            }),
            bandwidth: Math.floor(Math.random() * 100) + 150, // Random 150-250 Mbps
            timestamp: timestamp.getTime()
        });
    }
    return data;
};

const INITIAL_STATS: Stats = {
    totalBandwidth: 187,
    activeDevices: 24,
    avgLatency: 18,
};

const INITIAL_TRAFFIC: TrafficDistribution[] = [
    { name: 'Academic', value: 12 },
    { name: 'Labs', value: 8 },
    { name: 'GH', value: 6 },
    { name: 'BH-1', value: 5 },
    { name: 'BH-2', value: 4 },
    { name: 'BH-3', value: 3 },
    { name: 'BH-4', value: 2 },
];

export default function NetworkOverview() {
    const [mounted, setMounted] = useState(false);
    const [telemetryData, setTelemetryData] = useState<ChartData[]>(generateDummyData());
    const [stats, setStats] = useState<Stats>(INITIAL_STATS);
    const [trafficDistribution, setTrafficDistribution] = useState<TrafficDistribution[]>(INITIAL_TRAFFIC);

    // Simulated data update for demo purposes
    const [isSimulating, setIsSimulating] = useState(true);

    // Memoize the fetch function to prevent unnecessary re-renders
    const fetchTelemetryData = useCallback(async () => {
        try {
            const response = await fetch('/api/telemetry');
            if (!response.ok) throw new Error('Failed to fetch telemetry');

            const data: TelemetryItem[] = await response.json();

            if (data && Array.isArray(data) && data.length > 0) {
                setIsSimulating(false); // Disable simulation when real data arrives

                // Filter data from last 10 minutes
                const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
                const recentData = data.filter((item: TelemetryItem) =>
                    new Date(item.timestamp).getTime() >= tenMinutesAgo
                );

                if (recentData.length === 0) {
                    // If no recent data, keep simulating
                    setIsSimulating(true);
                    return;
                }

                // Process chart data - group by minute and keep only latest reading per device
                const timeGrouped = recentData.reduce((acc: Record<number, Record<string, TelemetryItem>>, curr: TelemetryItem) => {
                    const timestamp = new Date(curr.timestamp);

                    // Round to nearest minute
                    const roundedTime = new Date(timestamp);
                    roundedTime.setSeconds(0, 0);
                    const timeKey = roundedTime.getTime();

                    if (!acc[timeKey]) {
                        acc[timeKey] = {};
                    }

                    // Keep only the latest reading for each device in this time bucket
                    const deviceId = curr.device_id;
                    if (!acc[timeKey][deviceId] ||
                        new Date(curr.timestamp).getTime() > new Date(acc[timeKey][deviceId].timestamp).getTime()) {
                        acc[timeKey][deviceId] = curr;
                    }

                    return acc;
                }, {});

                // Convert to chart data - sum bandwidth from latest reading per device
                const chartData = Object.entries(timeGrouped)
                    .map(([timeKey, devices]) => {
                        const timestamp = parseInt(timeKey);
                        const time = new Date(timestamp).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                        });

                        // Sum bandwidth from latest reading of each device
                        const totalBandwidth = Object.values(devices).reduce(
                            (sum, device) => sum + (device.bandwidth_kbps || 0),
                            0
                        );

                        return {
                            time,
                            bandwidth: Math.round(totalBandwidth / 1024), // Convert to Mbps
                            timestamp
                        };
                    })
                    .sort((a, b) => a.timestamp - b.timestamp);

                setTelemetryData(chartData);

                // Calculate stats from latest telemetry per device
                const latestByDevice = recentData.reduce((acc: Record<string, TelemetryItem>, curr: TelemetryItem) => {
                    const deviceId = curr.device_id;
                    if (!acc[deviceId] || new Date(curr.timestamp).getTime() > new Date(acc[deviceId].timestamp).getTime()) {
                        acc[deviceId] = curr;
                    }
                    return acc;
                }, {});

                const latestReadings = Object.values(latestByDevice);
                const totalBw = latestReadings.reduce((acc, curr) => acc + (curr.bandwidth_kbps || 0), 0);
                const uniqueDevices = latestReadings.length;

                // Calculate actual latency instead of random
                const validLatencies = latestReadings
                    .filter(d => d.latency_ms && d.latency_ms > 0)
                    .map(d => d.latency_ms as number);

                const avgLatency = validLatencies.length > 0
                    ? Math.round(validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length)
                    : 18; // Fallback reasonable latency

                setStats({
                    totalBandwidth: Math.round(totalBw / 1024),
                    activeDevices: uniqueDevices,
                    avgLatency,
                });

                // Update traffic distribution from latest readings
                const counts: Record<string, number> = { academic: 0, labs: 0, gh: 0, bh1: 0, bh2: 0, bh3: 0, bh4: 0 };
                latestReadings.forEach(d => {
                    const trafficClass = d.traffic_class?.toLowerCase() || 'bh4';
                    if (trafficClass === 'academic') counts.academic++;
                    else if (trafficClass === 'labs') counts.labs++;
                    else if (trafficClass === 'gh') counts.gh++;
                    else if (trafficClass === 'bh-1' || trafficClass === 'bh1') counts.bh1++;
                    else if (trafficClass === 'bh-2' || trafficClass === 'bh2') counts.bh2++;
                    else if (trafficClass === 'bh-3' || trafficClass === 'bh3') counts.bh3++;
                    else counts.bh4++;
                });

                setTrafficDistribution([
                    { name: 'Academic', value: counts.academic },
                    { name: 'Labs', value: counts.labs },
                    { name: 'GH', value: counts.gh },
                    { name: 'BH-1', value: counts.bh1 },
                    { name: 'BH-2', value: counts.bh2 },
                    { name: 'BH-3', value: counts.bh3 },
                    { name: 'BH-4', value: counts.bh4 },
                ]);
            }
        } catch (error) {
            console.error('Failed to fetch telemetry:', error);
        }
    }, []);

    // Simulate live data updates when no real data is available
    useEffect(() => {
        if (!isSimulating || !mounted) return;

        const simulateUpdate = () => {
            // Update bandwidth with realistic variations
            const newBandwidth = Math.floor(Math.random() * 80) + 150; // 150-230 Mbps

            // Update chart data
            setTelemetryData(prev => {
                const now = new Date();
                const newDataPoint = {
                    time: now.toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                    }),
                    bandwidth: newBandwidth,
                    timestamp: now.getTime()
                };

                const updated = [...prev, newDataPoint];
                return updated.slice(-30); // Keep last 30 points
            });

            // Update stats with variations
            setStats(prev => ({
                totalBandwidth: newBandwidth,
                activeDevices: Math.max(20, prev.activeDevices + Math.floor(Math.random() * 5) - 2), // Vary ±2
                avgLatency: Math.max(10, Math.min(30, prev.avgLatency + Math.floor(Math.random() * 7) - 3)), // Vary ±3
            }));

            // Occasionally update traffic distribution
            if (Math.random() > 0.7) {
                setTrafficDistribution(prev =>
                    prev.map(item => ({
                        ...item,
                        value: Math.max(0, item.value + Math.floor(Math.random() * 3) - 1)
                    }))
                );
            }
        };

        const interval = setInterval(simulateUpdate, 3000); // Update every 3 seconds
        return () => clearInterval(interval);
    }, [isSimulating, mounted]);

    // Load initial data and set up polling
    useEffect(() => {
        setMounted(true);
        fetchTelemetryData();

        // Poll every 10 seconds instead of 5 to reduce load
        const interval = setInterval(fetchTelemetryData, 10000);
        return () => clearInterval(interval);
    }, [fetchTelemetryData]);

    // Properly handle Pusher updates
    usePusher('scwms-telemetry', 'update', useCallback((data: any) => {
        if (!mounted || !data) return;

        try {
            const updateData = Array.isArray(data) ? data : [data];
            if (updateData.length === 0) return;

            const timestamp = new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });

            const totalBw = updateData.reduce((acc: number, curr: any) =>
                acc + (curr.bandwidth_kbps || 0), 0
            );
            const activeDevs = new Set(updateData.map((d: any) => d.device_id)).size;

            // Calculate actual latency from the data
            const validLatencies = updateData
                .filter((d: any) => d.latency_ms && d.latency_ms > 0)
                .map((d: any) => d.latency_ms);

            const avgLatency = validLatencies.length > 0
                ? Math.round(validLatencies.reduce((a: number, b: number) => a + b, 0) / validLatencies.length)
                : stats.avgLatency; // Keep previous value if no new latency data

            setStats(prev => ({
                totalBandwidth: Math.round(totalBw / 1024),
                activeDevices: activeDevs,
                avgLatency: avgLatency || prev.avgLatency,
            }));

            // Update chart with new data point
            setTelemetryData(prev => {
                const newData = [...prev, {
                    time: timestamp,
                    bandwidth: Math.round(totalBw / 1024),
                    timestamp: Date.now()
                }];
                // Keep last 30 data points maximum
                return newData.slice(-30);
            });

            // Update traffic distribution
            const counts: Record<string, number> = { academic: 0, labs: 0, gh: 0, bh1: 0, bh2: 0, bh3: 0, bh4: 0 };
            updateData.forEach((d: any) => {
                const trafficClass = d.traffic_class?.toLowerCase() || 'bh4';
                if (trafficClass === 'academic') counts.academic++;
                else if (trafficClass === 'labs') counts.labs++;
                else if (trafficClass === 'gh') counts.gh++;
                else if (trafficClass === 'bh-1' || trafficClass === 'bh1') counts.bh1++;
                else if (trafficClass === 'bh-2' || trafficClass === 'bh2') counts.bh2++;
                else if (trafficClass === 'bh-3' || trafficClass === 'bh3') counts.bh3++;
                else counts.bh4++;
            });

            setTrafficDistribution([
                { name: 'Academic', value: counts.academic },
                { name: 'Labs', value: counts.labs },
                { name: 'GH', value: counts.gh },
                { name: 'BH-1', value: counts.bh1 },
                { name: 'BH-2', value: counts.bh2 },
                { name: 'BH-3', value: counts.bh3 },
                { name: 'BH-4', value: counts.bh4 },
            ]);
        } catch (error) {
            console.error('Error processing Pusher update:', error);
        }
    }, [mounted, stats.avgLatency]));

    if (!mounted) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 bg-surface rounded-xl border border-border shadow-sm animate-pulse"></div>
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2].map((i) => (
                        <div key={i} className="h-[400px] bg-surface rounded-xl border border-border shadow-sm animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Bandwidth */}
                <div className="card-modern p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-text-tertiary uppercase tracking-wider">
                            Total Bandwidth
                        </h3>
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <Activity className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-primary">
                            {stats.totalBandwidth.toLocaleString()}
                        </span>
                        <span className="text-sm font-medium text-text-secondary">Mbps</span>
                    </div>
                    <div className="w-full bg-divider rounded-full h-1.5 mt-4">
                        <div
                            className="bg-primary h-1.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min((stats.totalBandwidth / 500) * 100, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Active Devices */}
                <div className="card-modern p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-text-tertiary uppercase tracking-wider">
                            Active Devices
                        </h3>
                        <div className="p-2 bg-success/10 rounded-lg text-success">
                            <Wifi className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-3xl font-bold text-text-primary">
                            {stats.activeDevices}
                        </span>
                        <span className="text-sm font-medium text-text-secondary">devices</span>
                    </div>
                    <div className="mt-4">
                        <span className="badge badge-success">
                            Network Healthy
                        </span>
                    </div>
                </div>

                {/* Avg Latency */}
                <div className="card-modern p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-text-tertiary uppercase tracking-wider">
                            Avg Latency
                        </h3>
                        <div className="p-2 bg-warning/10 rounded-lg text-warning">
                            <Zap className="w-5 h-5" />
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                        <span className={`text-3xl font-bold ${stats.avgLatency < 30 ? 'text-success' :
                            stats.avgLatency < 50 ? 'text-warning' : 'text-danger'
                            }`}>
                            {stats.avgLatency}
                        </span>
                        <span className="text-sm font-medium text-text-secondary">ms</span>
                    </div>
                    <div className="w-full bg-divider rounded-full h-1.5 mt-4">
                        <div
                            className={`h-1.5 rounded-full transition-all duration-500 ${stats.avgLatency < 30 ? 'bg-success' :
                                stats.avgLatency < 50 ? 'bg-warning' : 'bg-danger'
                                }`}
                            style={{ width: `${Math.min((stats.avgLatency / 100) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Live Traffic Chart */}
                <div className="card-modern p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-text-primary">Network Traffic</h3>
                            <p className="text-sm text-text-secondary">Real-time bandwidth usage</p>
                        </div>
                        <span className="badge badge-info">Live</span>
                    </div>

                    <div className="h-[300px] w-full">
                        {telemetryData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={telemetryData}>
                                    <defs>
                                        <linearGradient id="colorBandwidth" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                                    <XAxis
                                        dataKey="time"
                                        stroke="var(--color-text-tertiary)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dy={10}
                                    />
                                    <YAxis
                                        stroke="var(--color-text-tertiary)"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        dx={-10}
                                        label={{ value: 'Mbps', angle: -90, position: 'insideLeft', fill: 'var(--color-text-tertiary)', fontSize: 12 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--color-surface)',
                                            borderColor: 'var(--color-border)',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                        itemStyle={{ color: 'var(--color-text-primary)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="bandwidth"
                                        stroke="var(--color-primary)"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 4, fill: 'var(--color-primary)' }}
                                        fill="url(#colorBandwidth)"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-text-tertiary">
                                <Activity className="w-8 h-8 mb-2 opacity-50" />
                                <p className="text-sm">Waiting for data...</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Traffic Distribution */}
                <div className="card-modern p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-lg font-semibold text-text-primary">Traffic Distribution</h3>
                            <p className="text-sm text-text-secondary">Bandwidth usage by category</p>
                        </div>
                    </div>

                    <div className="h-[300px] w-full relative">
                        {trafficDistribution.some(item => item.value > 0) ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={trafficDistribution.filter(item => item.value > 0)}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {trafficDistribution.filter(item => item.value > 0).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--color-surface)',
                                            borderColor: 'var(--color-border)',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                        }}
                                        itemStyle={{ color: 'var(--color-text-primary)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-text-tertiary">
                                <Wifi className="w-8 h-8 mb-2 opacity-50" />
                                <p className="text-sm">No active traffic</p>
                            </div>
                        )}

                        {/* Custom Legend */}
                        <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 flex-wrap">
                            {trafficDistribution.map((entry, index) => (
                                <div key={entry.name} className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                    />
                                    <span className="text-sm text-text-secondary">
                                        {entry.name}
                                        <span className="ml-1 text-text-tertiary">({entry.value})</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
