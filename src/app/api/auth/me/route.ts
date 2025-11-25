import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { SessionModel } from '@/lib/models';

export async function GET(req: Request) {
    try {
        await connectDB();

        // Get token from Authorization header
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        const session = await SessionModel.findByToken(token);

        if (!session) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        return NextResponse.json({
            authenticated: true,
            role: session.role,
            user: { name: `${session.role.charAt(0).toUpperCase() + session.role.slice(1)} User` }
        });
    } catch (error) {
        console.error('Auth check error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
