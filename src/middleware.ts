import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Add Cache-Control headers to authenticated routes to prevent back-button cache
    if (pathname.startsWith('/admin') || pathname.startsWith('/faculty') || pathname.startsWith('/student')) {
        const response = NextResponse.next();
        response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        response.headers.set('Pragma', 'no-cache');
        response.headers.set('Expires', '0');
        return response;
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/faculty/:path*',
        '/student/:path*',
    ],
};
