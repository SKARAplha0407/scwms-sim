import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { SessionModel } from '@/lib/models';
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
    try {
        await connectDB();
        const body = await req.json();
        const { role, password } = body;

        // Simple validation (In real app, check DB for users)
        let isValid = false;
        if (role === 'admin' && password === 'admin') isValid = true;
        if (role === 'faculty' && password === 'faculty') isValid = true;
        if (role === 'student' && password === 'student') isValid = true;

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Create Session
        const token = randomUUID();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await SessionModel.create({
            token,
            role,
            expires_at: expiresAt
        });

        // Return token (In real app, set HTTP-only cookie)
        // For this demo, we return it to be stored in sessionStorage but validated on server
        return NextResponse.json({ success: true, token, role });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
