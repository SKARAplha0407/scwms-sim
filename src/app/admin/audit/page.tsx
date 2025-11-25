import connectDB from '@/lib/db';
import { AuditLogModel } from '@/lib/models';
import { FileText, User, Clock, AlertCircle } from 'lucide-react';

// This page can be server-rendered for initial load
export const dynamic = 'force-dynamic';

async function getAuditLogs() {
    try {
        const db = await connectDB();
        if (!db) return null; // No MySQL configured
        return await AuditLogModel.find(50);
    } catch (error) {
        console.error('Failed to fetch audit logs:', error);
        return null;
    }
}

export default async function AuditPage() {
    const logs = await getAuditLogs();

    // If MySQL is not configured, show setup instructions
    if (logs === null) {
        return (
            <div className="space-y-6">
                <div className="card-modern p-6">
                    <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Audit Logs</h1>
                    <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>Immutable record of all system actions.</p>
                </div>

                <div className="card-modern p-6" style={{ borderColor: 'var(--color-warning)' }}>
                    <div className="flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" style={{ color: 'var(--color-warning)' }} />
                        <div className="flex-1">
                            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>MySQL Not Connected</h3>
                            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                                To use the Audit Logs feature, ensure MySQL is running and accessible.
                            </p>
                            <div className="card-modern p-4 font-mono text-xs space-y-2">
                                <p style={{ color: 'var(--color-text-secondary)' }}>Current configuration:</p>
                                <pre style={{ color: 'var(--color-text-primary)' }}>
                                    Host: localhost
                                    User: root
                                    Password: Shreyas123
                                    Database: scwms_sim
                                </pre>
                            </div>
                            <p className="text-sm mt-4" style={{ color: 'var(--color-text-secondary)' }}>
                                Make sure MySQL is running: <code className="px-2 py-1 rounded" style={{ background: 'var(--color-surface-hover)', fontFamily: 'var(--font-mono)' }}>mysql.server start</code>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="card-modern p-6">
                <h1 className="text-3xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Audit Logs</h1>
                <p className="mt-2" style={{ color: 'var(--color-text-secondary)' }}>Immutable record of all system actions.</p>
            </div>

            <div className="card-modern overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead style={{ background: 'var(--color-surface-hover)', borderBottom: '1px solid var(--color-border)' }}>
                            <tr>
                                <th className="text-left p-4 font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Timestamp</th>
                                <th className="text-left p-4 font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Action</th>
                                <th className="text-left p-4 font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Actor</th>
                                <th className="text-left p-4 font-semibold" style={{ color: 'var(--color-text-secondary)' }}>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log.id} style={{ borderBottom: '1px solid var(--color-divider)' }}>
                                    <td className="p-4 whitespace-nowrap" style={{ color: 'var(--color-text-secondary)' }}>
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-3 h-3" />
                                            {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className="status-badge status-info">
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-4" style={{ color: 'var(--color-text-primary)' }}>
                                        <div className="flex items-center gap-2">
                                            <User className="w-3 h-3" style={{ color: 'var(--color-text-secondary)' }} />
                                            {log.actor}
                                        </div>
                                    </td>
                                    <td className="p-4 font-mono text-xs max-w-md truncate" style={{ color: 'var(--color-text-secondary)' }}>
                                        {JSON.stringify(log.details_json)}
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="p-8 text-center" style={{ color: 'var(--color-text-secondary)' }}>
                                        No audit logs found. Start using the system to generate logs.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
