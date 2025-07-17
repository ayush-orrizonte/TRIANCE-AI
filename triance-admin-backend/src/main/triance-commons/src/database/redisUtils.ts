import { createClient, RedisClientType } from "redis";
import { EnvUtils } from "../config";
import { LoggerUtils } from "../audit";
import { CacheTTL } from "../enums";

export class RedisUtils {
    private primaryClient: RedisClientType | null = null;
    private replicaClient: RedisClientType | null = null;
    private logger = LoggerUtils.getLogger("RedisUtils");
    private prefixKey: string = EnvUtils.getString("REDIS_KEY_PREFIX");
    private static instance: RedisUtils | null = null;

    public static getInstance(): RedisUtils {
        if (!RedisUtils.instance) {
            RedisUtils.instance = new RedisUtils();
        }
        return RedisUtils.instance;
    }

    private async createRedisClient(
        host: string,
        port: number,
        options: { username: string; password: string; tls: boolean },
        readonly: boolean = true
    ): Promise<RedisClientType> {
        try {
            const url = `${options.tls ? "rediss" : "redis"}://${host}:${port}`;
            const client = createClient({
                url,
                readonly,
                username: options.username,
                password: options.password,
            }) as RedisClientType;
    
            client.on("error", (err) => this.logger.error(`Redis Connection Failed :: ${err.message} :: ${err}`));
            client.on("connect", () => this.logger.info(`Redis ${readonly ? "Reader Replica" : ""}Connected`));
            await client.connect();
            return client;
        } catch (error: any) {
            this.logger.error(`Error creating Redis client :: ${error.message} :: ${error}`);
            throw error;
        }
    }

    public async connect(): Promise<void> {
        try {
            const host = EnvUtils.getString("REDIS_HOST", "localhost");
            const port = EnvUtils.getNumber("REDIS_PORT", 6379);
            const username = EnvUtils.getString("REDIS_USERNAME");
            const password = EnvUtils.getString("REDIS_PASSWORD");
            const tls = EnvUtils.getBoolean("REDIS_TLS", false);

            this.primaryClient = await this.createRedisClient(host, port, { username, password, tls }, false);
            
            const replicaHost = EnvUtils.getString("REDIS_REPLICA_HOST");
            if (replicaHost) this.replicaClient = await this.createRedisClient(replicaHost, port, { username, password, tls });
        } catch (error: any) {
            this.logger.error(`Error connecting to Redis :: ${error.message} :: ${error}`);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        try {
            if (this.primaryClient) {
                await this.primaryClient.quit();
            }
            if (this.replicaClient) {
                await this.replicaClient.quit();
            }
            this.logger.info("Disconnected from Redis");
        } catch (error: any) {
            this.logger.error(`Error disconnecting from Redis :: ${error.message} :: ${error}`);
            throw error;
        }
    }

    private getPrefixedKey(key: string): string {
        return `${this.prefixKey}${key}`;
    }

    public getClient(primary = true): RedisClientType | null {
        try {
            return primary ? this.primaryClient : this.replicaClient;
        } catch (error: any) {
            this.logger.error(`Error getting Redis client :: ${error.message} :: ${error}`);
            throw error;
        }
    }

    public async set(key: string, value: string, expiryInSeconds?: CacheTTL): Promise<void> {
        try {
            if (!this.primaryClient) throw new Error("Redis primary client is not connected");
            const fullKey = this.getPrefixedKey(key);
            if (expiryInSeconds) {
                await this.primaryClient.set(fullKey, value, { EX: expiryInSeconds });
            } else {
                await this.primaryClient.set(fullKey, value);
            }
        } catch (error: any) {
            this.logger.error(`Error setting key ${key} :: ${error.message} :: ${error}`);
            throw error;
        }
    }

    public async get(key: string): Promise<string | null> {
        try {
            const client = this.replicaClient || this.primaryClient;
            if (!client) throw new Error("Redis replica client is not connected");
            const fullKey = this.getPrefixedKey(key);
            return await client.get(fullKey);
        } catch (error: any) {
            this.logger.error(`Error getting key ${key} :: ${error.message} :: ${error}`);
            throw error;
        }
    }

    public async delete(key: string): Promise<void> {
        try {
            if (!this.primaryClient) throw new Error("Redis primary client is not connected");
            const fullKey = this.getPrefixedKey(key);
            await this.primaryClient.del(fullKey);
        } catch (error: any) {
            this.logger.error(`Error deleting key ${key} :: ${error.message} :: ${error}`);
            throw error;
        }
    }

    public async exists(key: string): Promise<boolean> {
        try {
            const client = this.replicaClient || this.primaryClient;
            if (!client) throw new Error("Redis replica client is not connected");
            const fullKey = this.getPrefixedKey(key);
            return (await client.exists(fullKey)) > 0;
        } catch (error: any) {
            this.logger.error(`Error checking existence of key ${key} :: ${error.message} :: ${error}`);
            throw error;
        }
    }

    public async keys(pattern: string): Promise<string[]> {
        try {
            const client = this.replicaClient || this.primaryClient;
            if (!client) throw new Error("Redis replica client is not connected");
            const prefixedPattern = `${this.prefixKey}:${pattern}`;
            return await client.keys(prefixedPattern);
        } catch (error: any) {
            this.logger.error(`Error fetching keys with pattern ${pattern} :: ${error.message} :: ${error}`);
            throw error;
        }
    }

    public async increment(key: string): Promise<number> {
        try {
            if (!this.primaryClient) throw new Error("Redis primary client is not connected");
            const fullKey = this.getPrefixedKey(key);
            return await this.primaryClient.incr(fullKey);
        } catch (error: any) {
            this.logger.error(`Error incrementing key ${key} :: ${error.message} :: ${error}`);
            throw error;
        }
    }

    public async decrement(key: string): Promise<number> {
        try {
            if (!this.primaryClient) throw new Error("Redis primary client is not connected");
            const fullKey = this.getPrefixedKey(key);
            return await this.primaryClient.decr(fullKey);
        } catch (error: any) {
            this.logger.error(`Error decrementing key ${key} :: ${error.message} :: ${error}`);
            throw error;
        }
    }
}