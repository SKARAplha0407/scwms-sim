import { CriticalEventModel } from './models';
import connectDB from './db';

export type TrafficClass = 'academic' | 'video' | 'social' | 'other';
export type UserRole = 'student' | 'faculty' | 'guest';

export interface SimulationState {
    academicHours: boolean;
    criticalEventActive: boolean;
    deviceCount: number;
}

export const ACADEMIC_DOMAINS = ['moodle.edu', 'library.edu', 'lms.edu', 'canvas.instructure.com'];
export const VIDEO_DOMAINS = ['youtube.com', 'netflix.com', 'twitch.tv', 'vimeo.com'];
export const SOCIAL_DOMAINS = ['facebook.com', 'instagram.com', 'twitter.com', 'tiktok.com'];

export function classifyTraffic(url: string, role: UserRole): TrafficClass {
    if (ACADEMIC_DOMAINS.some(d => url.includes(d))) return 'academic';
    if (VIDEO_DOMAINS.some(d => url.includes(d))) return 'video';
    if (SOCIAL_DOMAINS.some(d => url.includes(d))) return 'social';
    return 'other';
}

export async function getSimulationState(): Promise<SimulationState> {
    await connectDB();

    // Check for active critical event
    const activeEvent = await CriticalEventModel.findOne({ active: true });

    // Check academic hours (hardcoded for sim: 9am - 5pm)
    const now = new Date();
    const hour = now.getHours();
    const isAcademicHours = hour >= 9 && hour < 17;

    return {
        academicHours: isAcademicHours,
        criticalEventActive: !!activeEvent,
        deviceCount: 50, // Default, can be dynamic later
    };
}

export function generateDeviceTelemetry(deviceId: string, state: SimulationState) {
    const isAcademic = state.academicHours;
    const isCritical = state.criticalEventActive;

    // Base load
    let bandwidth = Math.floor(Math.random() * 10000); // 0-10Mbps
    let connections = Math.floor(Math.random() * 20);

    // Modifiers
    if (isAcademic) {
        // More academic traffic, higher load
        bandwidth += 5000;
        connections += 10;
    }

    if (isCritical) {
        // Critical event might mean high load or restricted
        // Let's simulate high load for "Exam" scenario
        bandwidth += 10000;
    }

    // Generate sample URLs
    const urls = [];
    const numUrls = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numUrls; i++) {
        const rand = Math.random();
        if (rand < 0.4) urls.push(ACADEMIC_DOMAINS[Math.floor(Math.random() * ACADEMIC_DOMAINS.length)]);
        else if (rand < 0.7) urls.push(VIDEO_DOMAINS[Math.floor(Math.random() * VIDEO_DOMAINS.length)]);
        else urls.push(SOCIAL_DOMAINS[Math.floor(Math.random() * SOCIAL_DOMAINS.length)]);
    }

    return {
        device_id: deviceId,
        bandwidth_kbps: bandwidth,
        active_connections: connections,
        sample_urls: urls,
        cpu: Math.floor(Math.random() * 100),
        memory: Math.floor(Math.random() * 100),
        timestamp: new Date().toISOString(),
    };
}
