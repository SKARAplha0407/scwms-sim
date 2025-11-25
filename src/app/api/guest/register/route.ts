import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { GuestSessionModel, AuditLogModel } from '@/lib/models';

export async function POST(req: Request) {
    try {
        await connectDB();
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: 'Email required' }, { status: 400 });
        }

        // Create session (expires in 24h)
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const session = await GuestSessionModel.create({
            email,
            expires_at: expiresAt,
        });

        // Audit log
        await AuditLogModel.create({
            action: 'GUEST_REGISTER',
            actor: 'system',
            details_json: { email, session_id: session.id },
        });

        return NextResponse.json({ success: true, session });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
