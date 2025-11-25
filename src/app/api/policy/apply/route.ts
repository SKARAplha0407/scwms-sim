import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { PolicyModel, AuditLogModel } from '@/lib/models';
import { pusherServer } from '@/lib/pusher';

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { name, config, actor = 'admin' } = body;

        if (!name || !config) {
            return NextResponse.json({ error: 'Missing policy details' }, { status: 400 });
        }

        // 1. Save Policy
        const policy = await PolicyModel.create({
            name,
            config_json: config,
        });

        // 2. Create Audit Log
        await AuditLogModel.create({
            action: 'APPLY_POLICY',
            actor,
            details_json: { policy_id: policy.id, name, config },
        });

        // 3. Update Simulation State (Critical Events)
        // Import CriticalEventModel dynamically or ensure it's imported
        const { CriticalEventModel } = await import('@/lib/models');

        if (name === 'EXAM_MODE') {
            await CriticalEventModel.setActive('Exam Mode', true);
        } else {
            // Assume other policies turn off critical mode for now
            await CriticalEventModel.setActive('Normal', false);
        }

        // 3. Broadcast Event (optional)
        try {
            await pusherServer.trigger('scwms-policy', 'applied', {
                applied: true,
                policy: { name, config },
                simulated_controller_command: `APPLY_QOS(priority=${name}, config=${JSON.stringify(config)})`
            });
        } catch (e) {
            // Skip if Pusher not configured
        }

        return NextResponse.json({
            success: true,
            applied: true,
            policy: { name, config },
            simulated_controller_command: `APPLY_QOS(priority=${name}, config=${JSON.stringify(config)})`
        });
    } catch (error) {
        console.error('Policy application error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
