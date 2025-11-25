import { NextResponse } from 'next/server';
import { generateDeviceTelemetry, getSimulationState, classifyTraffic } from '@/lib/simulation-engine';
import { pusherServer } from '@/lib/pusher';
import { TelemetryModel } from '@/lib/models';
import connectDB from '@/lib/db';

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { deviceCount = 20 } = body;

        const state = await getSimulationState();
        const telemetryBatch = [];

        for (let i = 1; i <= deviceCount; i++) {
            const deviceId = `ap-${String(i).padStart(2, '0')}`;
            const data = generateDeviceTelemetry(deviceId, state);

            const mainUrl = data.sample_urls[0] || 'google.com';
            const trafficClass = classifyTraffic(mainUrl, 'student');

            telemetryBatch.push({
                device_id: data.device_id,
                bandwidth_kbps: data.bandwidth_kbps,
                active_connections: data.active_connections,
                sample_urls: data.sample_urls,
                cpu: data.cpu,
                memory: data.memory,
                traffic_class: trafficClass,
            });
        }

        // 1. Store in DB
        await TelemetryModel.insertMany(telemetryBatch);

        // 2. Broadcast via Pusher (optional)
        try {
            await pusherServer.trigger('scwms-telemetry', 'update', telemetryBatch);
        } catch (e) {
            console.log('Pusher not configured, skipping broadcast');
        }

        return NextResponse.json({ success: true, count: telemetryBatch.length });
    } catch (error) {
        console.error('Simulation error:', error);
        return NextResponse.json({ success: false, error: 'Simulation failed' }, { status: 500 });
    }
}
