import pg, { Pool, PoolConfig, PoolClient, QueryResult, QueryResultRow } from 'pg';
import fs from 'fs';
import envUtils from "../config/envUtils";

interface PgParams extends PoolConfig {
    ssl?: {
        ca: Buffer;
    };
}

interface QueryOptions {
    query: string;
    params?: any[];
}

const connectionRequired = envUtils.getBooleanEnvVariableOrDefault("INIT_COMMON_PG_DB_REQUIRED", false);
const tlsEnabled = envUtils.getBooleanEnvVariableOrDefault("INIT_COMMON_MASTER_TLS", false);
const tlsPath = envUtils.getStringEnvVariable("INIT_COMMON_MASTER_TLS_PATH");

const params: PgParams = {
    user: envUtils.getStringEnvVariableOrDefault("INIT_COMMON_MASTER_USER", "postgres"),
    database: envUtils.getStringEnvVariableOrDefault("INIT_COMMON_MASTER_DATABASE", "postgres"),
    password: envUtils.getStringEnvVariableOrDefault("INIT_COMMON_MASTER_PASSWORD", "postgres"),
    host: envUtils.getStringEnvVariableOrDefault("INIT_COMMON_MASTER_HOST", "localhost"),
    port: envUtils.getNumberEnvVariableOrDefault("INIT_COMMON_MASTER_PORT", 5432),
    max: 1,
    idleTimeoutMillis: envUtils.getNumberEnvVariableOrDefault("INIT_COMMON_PG_TIMEOUT", 10000)
};

if (tlsEnabled && tlsPath) {
    params.ssl = {
        ca: fs.readFileSync(tlsPath)
    };
}

class PgClient {
    private static instance: PgClient;
    private pool: Pool | null = null;

    private constructor() {
        if (connectionRequired) {
            this.pool = new pg.Pool(params);
        }
    }

    public static getInstance(): PgClient {
        if (!PgClient.instance) {
            PgClient.instance = new PgClient();
        }
        return PgClient.instance;
    }

    public async executeQuery<T extends QueryResultRow = any>(
  query: string | { text: string; values?: any[] },
  params?: any[]
): Promise<T[]> {
  if (!this.pool) {
    throw new Error("Database pool not initialized");
  }

  const client = await this.pool.connect();
  try {
    let result: QueryResult<T>;

    if (typeof query === 'string') {
      result = await client.query<T>(query, params);
    } else {
      result = await client.query<T>(query.text, query.values);
    }

    return result.rows;
  } finally {
    client.release();
  }
}


    public async executeTransaction(queries: QueryOptions[]): Promise<void> {
        if (!this.pool) {
            throw new Error("Database pool not initialized");
        }

        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            
            for (const { query, params } of queries) {
                await client.query(query, params);
            }
            
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    public async healthCheck(): Promise<boolean> {
        if (!this.pool) {
            return false;
        }
        
        try {
            const client = await this.pool.connect();
            client.release();
            return true;
        } catch {
            return false;
        }
    }

    public getPool(): Pool | null {
        return this.pool;
    }
}

const pgClient = PgClient.getInstance();

export default pgClient;