import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { CriticalEventModel } from '@/lib/models';
import { getSimulationState } from '@/lib/simulation-engine';

export async function GET(req: Request) {
    try {
        await connectDB();
        const state = await getSimulationState();

        let decision = {
            priority: 'normal',
            bandwidth_allocation: {
                academic: '50%',
                video: '30%',
                social: '20%',
            },
            reason: 'Standard operating conditions',
        };

        if (state.criticalEventActive) {
            decision = {
                priority: 'critical',
                bandwidth_allocation: {
                    academic: '80%',
                    video: '10%',
                    social: '10%',
                },
                reason: 'CRITICAL EVENT ACTIVE: Prioritizing academic traffic',
            };
        } else if (state.academicHours) {
            decision = {
                priority: 'academic',
                bandwidth_allocation: {
                    academic: '70%',
                    video: '20%',
                    social: '10%',
                },
                reason: 'Academic hours: Prioritizing learning resources',
            };
        }

        return NextResponse.json(decision);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
