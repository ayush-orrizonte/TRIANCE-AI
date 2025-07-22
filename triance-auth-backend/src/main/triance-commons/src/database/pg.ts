import pg, { Pool, PoolConfig, QueryResultRow } from 'pg';
import fs from 'fs';
import { environment } from '../../../config/environment';

class DatabaseError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'DatabaseError';
  }
}

interface QueryOptions {
  text: string;
  values?: any[];
  timeout?: number; // in ms
}

class PgClient {
  private static instance: PgClient;
  private pool: Pool;

  private constructor() {
    const config = environment.postgres;

    if (!config.connectionRequired) {
      throw new DatabaseError(
        'Database connection is disabled. Set INIT_COMMON_PG_DB_REQUIRED=true to enable.'
      );
    }

    const poolParams: PoolConfig = {
      user: config.user,
      password: config.password,
      host: config.host,
      database: config.database,
      port: config.port,
      max: config.poolSize,
      idleTimeoutMillis: config.timeout,
      connectionTimeoutMillis: 5000,
    };

    if (config.tlsEnabled && config.tlsPath) {
      poolParams.ssl = {
        ca: fs.readFileSync(config.tlsPath),
      };
    }

    this.pool = new pg.Pool(poolParams);

    this.pool.on('connect', () => console.log('[PG] New client connected'));
    this.pool.on('error', (err) => console.error('[PG] Pool error:', err));
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
      throw new DatabaseError('Database pool is not initialized');
    }

    const client = await this.pool.connect();
    const isOptions = typeof query !== 'string';
    const queryText = isOptions ? query.text : query;
    const queryParams = isOptions ? query.values : params;
    const timeout = isOptions && query.timeout ? query.timeout : undefined;

    try {
      console.debug('[PG] Executing Query:', queryText, queryParams);

      if (timeout) {
        await client.query(`SET statement_timeout TO ${timeout}`);
      }

      const start = Date.now();
      const result = await client.query<T>(queryText, queryParams);
      const duration = Date.now() - start;
      console.debug(`[PG] Query executed in ${duration}ms`);

      return result.rows;
    } catch (error) {
      console.error('[PG] Query execution failed:', error);
      throw new DatabaseError('Query execution failed', error);
    } finally {
      if (timeout) {
        try {
          await client.query(`RESET statement_timeout`);
        } catch (resetError) {
          console.warn('[PG] Failed to reset statement_timeout:', resetError);
        }
      }
      client.release();
    }
  }

  public async executeTransaction(queries: QueryOptions[]): Promise<void> {
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
      throw new DatabaseError('Transaction failed', error);
    } finally {
      client.release();
    }
  }

  public async healthCheck(): Promise<boolean> {
    try {
      const result = await this.executeQuery<{ ok: number }>('SELECT 1 AS ok');
      return result.length === 1 && result[0].ok === 1;
    } catch {
      return false;
    }
  }

  public async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
      console.log('[PG] Pool closed');
    }
  }
}

const pgClient = PgClient.getInstance();
export default pgClient;
