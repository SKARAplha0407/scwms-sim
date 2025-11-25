// Mock Database Implementation for Serverless/Demo Environment
// Replaces mysql2 with in-memory storage

interface MockPool {
  query: <T = any>(sql: string, params?: any[]) => Promise<[T, any]>;
  getConnection: () => Promise<MockConnection>;
  end: () => Promise<void>;
}

interface MockConnection {
  query: <T = any>(sql: string, params?: any[]) => Promise<[T, any]>;
  release: () => void;
}

// In-memory storage
// In-memory storage with capped limits to prevent DoS
const MAX_STORE_ITEMS = 1000;

const store = {
  telemetry: [] as any[],
  policies: [] as any[],
  audit_logs: [] as any[],
  guest_sessions: [] as any[],
  critical_events: [] as any[],
  sessions: [] as any[], // [NEW] For Auth
};

// Helper to push with limit
const pushToStore = (collection: any[], item: any) => {
  collection.push(item);
  if (collection.length > MAX_STORE_ITEMS) {
    collection.shift(); // Remove oldest
  }
};

// Simple mutex to prevent race conditions in mock DB
let dbLock = Promise.resolve();

const withLock = async <T>(operation: () => T | Promise<T>): Promise<T> => {
  let result: T;
  await (dbLock = dbLock.then(async () => {
    result = await operation();
  }).catch(e => {
    console.error("DB Lock error", e);
    throw e;
  }));
  return result!;
};

// Helper to parse SQL and execute against store
const executeMockQuery = async <T = any>(sql: string, params: any[] = []): Promise<[T, any]> => {
  return withLock(async () => {
    const normalizedSql = sql.trim().toLowerCase();
    console.log('Mock DB Query:', sql, params);

    // SELECT
    if (normalizedSql.startsWith('select')) {
      if (normalizedSql.includes('from telemetry')) {
        // Mock returning recent telemetry
        return [[...store.telemetry].reverse().slice(0, 50), []] as [T, any];
      }
      if (normalizedSql.includes('from policies')) {
        return [store.policies, []] as [T, any];
      }
      if (normalizedSql.includes('from audit_logs')) {
        return [[...store.audit_logs].reverse().slice(0, 50), []] as [T, any];
      }
      if (normalizedSql.includes('from critical_events')) {
        return [store.critical_events, []] as [T, any];
      }
      if (normalizedSql.includes('from guest_sessions')) {
        return [store.guest_sessions, []] as [T, any];
      }
      if (normalizedSql.includes('from sessions')) {
        return [store.sessions, []] as [T, any];
      }
      return [[], []] as [T, any];
    }

    // INSERT
    if (normalizedSql.startsWith('insert into')) {
      if (normalizedSql.includes('telemetry')) {
        // Simple parsing for telemetry insert - assuming params match order
        // This is a simplification. In a real mock we'd parse column names.
        // For this specific app, we know the insert structure usually used.
        const newItem = {
          id: store.telemetry.length + 1,
          device_id: params[0] || 'mock-device',
          bandwidth_kbps: params[1] || 0,
          active_connections: params[2] || 0,
          sample_urls: params[3] || '[]',
          cpu: params[4] || 0,
          memory: params[5] || 0,
          traffic_class: params[6] || 'Other',
          timestamp: new Date()
        };
        pushToStore(store.telemetry, newItem);
        return [{ insertId: newItem.id, affectedRows: 1 }, []] as [T, any];
      }

      if (normalizedSql.includes('audit_logs')) {
        const newItem = {
          id: store.audit_logs.length + 1,
          action: params[0],
          actor: params[1],
          details_json: params[2],
          timestamp: new Date()
        };
        pushToStore(store.audit_logs, newItem);
        return [{ insertId: newItem.id, affectedRows: 1 }, []] as [T, any];
      }

      if (normalizedSql.includes('policies')) {
        const newItem = {
          id: store.policies.length + 1,
          name: params[0],
          config_json: params[1],
          created_at: new Date()
        };
        pushToStore(store.policies, newItem);
        return [{ insertId: newItem.id, affectedRows: 1 }, []] as [T, any];
      }

      if (normalizedSql.includes('critical_events')) {
        const newItem = {
          id: store.critical_events.length + 1,
          name: params[0],
          start_time: new Date(),
          end_time: null,
          active: true
        };
        pushToStore(store.critical_events, newItem);
        return [{ insertId: newItem.id, affectedRows: 1 }, []] as [T, any];
      }

      if (normalizedSql.includes('guest_sessions')) {
        const newItem = {
          id: store.guest_sessions.length + 1,
          email: params[0],
          expires_at: params[1],
          created_at: new Date()
        };
        pushToStore(store.guest_sessions, newItem);
        return [{ insertId: newItem.id, affectedRows: 1 }, []] as [T, any];
      }

      if (normalizedSql.includes('sessions')) {
        const newItem = {
          id: store.sessions.length + 1,
          token: params[0],
          role: params[1],
          expires_at: params[2],
          created_at: new Date()
        };
        pushToStore(store.sessions, newItem);
        return [{ insertId: newItem.id, affectedRows: 1 }, []] as [T, any];
      }
    }

    // UPDATE
    if (normalizedSql.startsWith('update')) {
      if (normalizedSql.includes('critical_events')) {
        // Mock closing an event
        store.critical_events.forEach(e => {
          if (e.active) {
            e.active = false;
            e.end_time = new Date();
          }
        });
        return [{ affectedRows: 1 } as any, []] as [T, any];
      }
    }

    // Default fallback
    return [[] as any, []] as [T, any];
  });
};

const mockPool: MockPool = {
  query: executeMockQuery,
  getConnection: async () => {
    return {
      query: executeMockQuery,
      release: () => { },
    };
  },
  end: async () => { },
};

// Singleton-ish behavior for the mock pool
let pool: MockPool | null = mockPool;

async function connectDB() {
  console.log('Using In-Memory Mock Database');
  return pool;
}

// Pre-populate some data for demo purposes
if (store.policies.length === 0) {
  store.policies.push({
    id: 1,
    name: 'Default Policy',
    config_json: JSON.stringify({ qos: 'standard', throttle: false }),
    created_at: new Date()
  });
}

export default connectDB;
export { pool };
