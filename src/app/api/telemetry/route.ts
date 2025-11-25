import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { TelemetryModel } from '@/lib/models';
import { pusherServer } from '@/lib/pusher';

export async function POST(req: Request) {
    try {
        await connectDB();
        const data = await req.json();

        // Validate data (basic)
        if (!data.device_id || data.bandwidth_kbps === undefined) {
            return NextResponse.json({ error: 'Invalid telemetry data' }, { status: 400 });
        }

        // Vector 4 Fix: Type Confusion
        if (typeof data.bandwidth_kbps !== 'number' || isNaN(data.bandwidth_kbps)) {
            return NextResponse.json({ error: 'bandwidth_kbps must be a number' }, { status: 400 });
        }
        if (data.active_connections && (typeof data.active_connections !== 'number' || isNaN(data.active_connections))) {
            return NextResponse.json({ error: 'active_connections must be a number' }, { status: 400 });
        }

        // Store
        const telemetry = await TelemetryModel.create(data);

        // Broadcast (optional)
        try {
            await pusherServer.trigger('scwms-telemetry', 'single-update', telemetry);
        } catch (e) {
            // Skip if Pusher not configured
        }

        return NextResponse.json({ success: true, id: telemetry.id });
    } catch (error) {
        console.error('Telemetry ingestion error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        await connectDB();
        // Get latest 5000 telemetry events (enough for ~10 minutes of history)
        // Simulation runs every 3s with 20 devices = ~400 records/min
        const events = await TelemetryModel.find(5000);
        return NextResponse.json(events);
    } catch (error) {
        console.error('Telemetry GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
