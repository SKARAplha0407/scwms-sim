import { pool } from './db';

// Define types to match our mock database (removed mysql2 dependency)
interface RowDataPacket {
    [key: string]: any;
}

interface ResultSetHeader {
    insertId: number;
    affectedRows: number;
}

// Telemetry
export interface Telemetry {
    id?: number;
    device_id: string;
    bandwidth_kbps: number;
    active_connections: number;
    sample_urls: string[];
    cpu: number;
    memory: number;
    traffic_class: string;
    timestamp?: Date;
}

export const TelemetryModel = {
    async create(data: Telemetry) {
        if (!pool) throw new Error('Database not connected');
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO telemetry (device_id, bandwidth_kbps, active_connections, sample_urls, cpu, memory, traffic_class) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [data.device_id, data.bandwidth_kbps, data.active_connections, JSON.stringify(data.sample_urls), data.cpu, data.memory, data.traffic_class]
        );
        return { id: result.insertId, ...data };
    },

    async insertMany(dataArray: Telemetry[]) {
        if (!pool) throw new Error('Database not connected');
        const values = dataArray.map(d => [d.device_id, d.bandwidth_kbps, d.active_connections, JSON.stringify(d.sample_urls), d.cpu, d.memory, d.traffic_class]);
        await pool.query(
            'INSERT INTO telemetry (device_id, bandwidth_kbps, active_connections, sample_urls, cpu, memory, traffic_class) VALUES ?',
            [values]
        );
        return dataArray;
    },

    async find(limit = 50) {
        if (!pool) throw new Error('Database not connected');
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM telemetry ORDER BY timestamp DESC LIMIT ?',
            [limit]
        );
        return rows.map(row => ({
            ...row,
            sample_urls: typeof row.sample_urls === 'string' ? JSON.parse(row.sample_urls) : row.sample_urls
        })) as Telemetry[];
    }
};

// Policy
export interface Policy {
    id?: number;
    name: string;
    config_json: any;
    created_at?: Date;
}

export const PolicyModel = {
    async create(data: Policy) {
        if (!pool) throw new Error('Database not connected');
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO policies (name, config_json) VALUES (?, ?)',
            [data.name, JSON.stringify(data.config_json)]
        );
        return { id: result.insertId, ...data };
    }
};

// AuditLog
export interface AuditLog {
    id?: number;
    action: string;
    actor: string;
    details_json: any;
    timestamp?: Date;
}

export const AuditLogModel = {
    async create(data: AuditLog) {
        if (!pool) throw new Error('Database not connected');
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO audit_logs (action, actor, details_json) VALUES (?, ?, ?)',
            [data.action, data.actor, JSON.stringify(data.details_json)]
        );
        return { id: result.insertId, ...data };
    },

    async find(limit = 50) {
        if (!pool) throw new Error('Database not connected');
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ?',
            [limit]
        );
        return rows.map(row => ({
            ...row,
            details_json: typeof row.details_json === 'string' ? JSON.parse(row.details_json) : row.details_json
        })) as AuditLog[];
    }
};

// GuestSession
export interface GuestSession {
    id?: number;
    email: string;
    status?: string;
    expires_at: Date;
    created_at?: Date;
}

export const GuestSessionModel = {
    async create(data: GuestSession) {
        if (!pool) throw new Error('Database not connected');
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO guest_sessions (email, expires_at) VALUES (?, ?)',
            [data.email, data.expires_at]
        );
        return { id: result.insertId, ...data };
    }
};

// CriticalEvent
export interface CriticalEvent {
    id?: number;
    name: string;
    start_time?: Date;
    end_time?: Date | null;
    active?: boolean;
}

export const CriticalEventModel = {
    async findOne(filter: { active: boolean }) {
        if (!pool) throw new Error('Database not connected');
        const [rows] = await pool.query<RowDataPacket[]>(
            'SELECT * FROM critical_events WHERE active = ? LIMIT 1',
            [filter.active ? 1 : 0]
        );
        if (rows.length === 0) return null;
        return rows[0] as CriticalEvent;
    },

    async setActive(name: string, active: boolean) {
        if (!pool) throw new Error('Database not connected');
        // Deactivate all first if setting active
        if (active) {
            await pool.query('UPDATE critical_events SET active = FALSE');
            // Insert or update
            await pool.query(
                'INSERT INTO critical_events (name, active, start_time) VALUES (?, TRUE, NOW())',
                [name]
            );
        } else {
            await pool.query('UPDATE critical_events SET active = FALSE WHERE active = TRUE');
        }
    }
};
