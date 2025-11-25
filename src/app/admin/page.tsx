import NetworkOverview from '@/components/dashboard/NetworkOverview';
import SimulationController from '@/components/SimulationController';

export default function AdminPage() {
    return (
        <div className="space-y-6">
            {/* Modern Page Header */}
            <div className="card-modern p-6">
                <h1 className="text-3xl font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
                    Dashboard
                </h1>
                <p style={{ color: 'var(--color-text-secondary)' }}>
                    Real-time network telemetry and system status
                </p>
            </div>

            {/* Main Content */}
            <NetworkOverview />

            {/* Simulation Controller */}
            <div className="fixed bottom-6 right-6 z-50">
                {/* <SimulationController /> */}
            </div>
        </div>
    );
}
