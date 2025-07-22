import pg, { Pool, PoolConfig, PoolClient, QueryResult, QueryResultRow } from 'pg';
import fs from 'fs';
import envUtils from "../config/envUtils";

class DatabaseError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'DatabaseError';
  }
}

interface PgParams extends PoolConfig {
    ssl?: {
        ca: Buffer;
    };
}

interface QueryOptions {
    text: string;
    values?: any[];
    timeout?: number;
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
    max: envUtils.getNumberEnvVariableOrDefault("INIT_COMMON_PG_POOL_SIZE", 10),
    min: envUtils.getNumberEnvVariableOrDefault("INIT_COMMON_PG_POOL_MIN", 2),
    idleTimeoutMillis: envUtils.getNumberEnvVariableOrDefault("INIT_COMMON_PG_TIMEOUT", 10000),
    connectionTimeoutMillis: 5000
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
            this.pool.on('connect', () => console.log('New client connected'));
            this.pool.on('error', (err) => console.error('Pool error:', err));
        }
    }

    public static getInstance(): PgClient {
        if (!PgClient.instance) {
            PgClient.instance = new PgClient();
        }
        return PgClient.instance;
    }

    public async executeQuery<T extends QueryResultRow = any>(
    query: string | QueryOptions,
    params?: any[]
): Promise<T[]> {
    if (!this.pool) {
        throw new DatabaseError("Database pool not initialized");
    }

    const client = await this.pool.connect();
    const isOptions = typeof query !== 'string';
    const queryText = isOptions ? query.text : query;
    const queryParams = isOptions ? query.values : params;
    const timeout = isOptions && query.timeout ? query.timeout : undefined;

    try {
        
        console.debug("Executing Query:", queryText);
        console.debug("With Parameters:", queryParams);

        if (timeout) {
            await client.query(`SET statement_timeout TO ${timeout}`);
        }

        const start = Date.now();
        const result = await client.query<T>(queryText, queryParams);
        const duration = Date.now() - start;

       
        console.debug(`Query executed in ${duration}ms`);

        return result.rows;
    } catch (error) {
        console.error("Query execution failed:", error);
        throw new DatabaseError("Query execution failed", error);
    } finally {

        if (timeout) {
            try {
                await client.query(`RESET statement_timeout`);
            } catch (resetError) {
                console.warn("Failed to reset statement_timeout:", resetError);
            }
        }

        client.release();
    }
}

    public async executeTransaction(queries: QueryOptions[]): Promise<void> {
        if (!this.pool) {
            throw new DatabaseError("Database pool not initialized");
        }

        const client = await this.pool.connect();
        try {
            await client.query('BEGIN');
            
            for (const query of queries) {
                if (query.timeout) {
                    await client.query(`SET statement_timeout TO ${query.timeout}`);
                }
                await client.query(query.text, query.values);
            }
            
            await client.query('COMMIT');
        } catch (error) {
            await client.query('ROLLBACK');
            throw new DatabaseError("Transaction failed", error);
        } finally {
            client.release();
        }
    }

    public async healthCheck(): Promise<boolean> {
        if (!this.pool) return false;
        
        try {
            const result = await this.executeQuery('SELECT 1');
            return result.length === 1 && result[0]['?column?'] === 1;
        } catch {
            return false;
        }
    }

    public async close(): Promise<void> {
        if (this.pool) {
            await this.pool.end();
            this.pool = null;
        }
    }

    public getPool(): Pool | null {
        return this.pool;
    }
}

const pgClient = PgClient.getInstance();

export default pgClient;
