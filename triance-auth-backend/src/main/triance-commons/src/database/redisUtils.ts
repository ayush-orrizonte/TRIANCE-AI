import { createClient, RedisClientType } from "redis";
import { EnvUtils } from "../config";
import { LoggerUtils } from "../audit";
import { CacheTTL } from "../enums";

export class RedisUtils {
    private client: RedisClientType | null = null;
    private logger = LoggerUtils.getLogger("RedisUtils");
    private prefixKey: string = EnvUtils.getString("REDIS_KEY_PREFIX");
    private static instance: RedisUtils | null = null;
    private connectionRetries = 0;
    private maxRetries = 3;

    // Singleton pattern
    public static getInstance(): RedisUtils {
        if (!RedisUtils.instance) {
            RedisUtils.instance = new RedisUtils();
        }
        return RedisUtils.instance;
    }

    // Create and configure Redis client
    private async createRedisClient(): Promise<RedisClientType> {
        const host = EnvUtils.getString("REDIS_HOST", "localhost");
        const port = EnvUtils.getNumber("REDIS_PORT", 6379);
        const username = EnvUtils.getString("REDIS_USERNAME");
        const password = EnvUtils.getString("REDIS_PASSWORD");
        const tls = EnvUtils.getBoolean("REDIS_TLS", false);

        const url = `${tls ? "rediss" : "redis"}://${host}:${port}`;
        const client = createClient({
            url,
            username,
            password,
            socket: {
                reconnectStrategy: (retries) => {
                    if (retries > 5) {
                        this.logger.error('Max reconnection attempts reached');
                        return new Error('Max reconnection attempts reached');
                    }
                    return Math.min(retries * 100, 5000);
                }
            }
        }) as RedisClientType;

        // Event handlers
        client.on("error", (err) => 
            this.logger.error(`Redis Connection Error: ${err.message}`));
        client.on("connect", () => 
            this.logger.info("Redis Connected"));
        client.on("ready", () => 
            this.logger.info("Redis Ready"));
        client.on("reconnecting", () => 
            this.logger.warn("Redis Reconnecting"));
        client.on("end", () => 
            this.logger.warn("Redis Disconnected"));

        return client;
    }

    // Establish connection with retry logic
    public async connect(): Promise<void> {
        try {
            if (this.client && this.client.isOpen) {
                return;
            }

            this.client = await this.createRedisClient();
            await this.client.connect();
            this.connectionRetries = 0;
            this.logger.info("Redis connection established");
        } catch (error: any) {
            this.connectionRetries++;
            if (this.connectionRetries <= this.maxRetries) {
                this.logger.warn(`Retrying Redis connection (attempt ${this.connectionRetries})`);
                await new Promise(resolve => setTimeout(resolve, 2000));
                return this.connect();
            }
            this.logger.error(`Failed to connect to Redis after ${this.maxRetries} attempts`);
            throw error;
        }
    }

    // Check connection status
    public isConnected(): boolean {
        return !!this.client?.isReady;
    }

    // Ensure connection is active
    public async ensureConnection(): Promise<void> {
        if (!this.isConnected()) {
            await this.connect();
        }
    }

    // Add prefix to keys
    private getPrefixedKey(key: string): string {
        return `${this.prefixKey}${key}`;
    }

    // Get value with optional fallback
    public async get(key: string, fallback?: () => Promise<string | null>): Promise<string | null> {
        try {
            await this.ensureConnection();
            if (!this.client) throw new Error("Redis client not connected");
            const fullKey = this.getPrefixedKey(key);
            return await this.client.get(fullKey);
        } catch (error: any) {
            this.logger.warn(`Redis get failed for key ${key}: ${error.message}`);
            if (fallback) {
                return fallback();
            }
            throw error;
        }
    }

    // Set value with optional TTL
    public async set(key: string, value: string, ttl?: CacheTTL): Promise<void> {
        try {
            await this.ensureConnection();
            if (!this.client) throw new Error("Redis client not connected");
            const fullKey = this.getPrefixedKey(key);
            const options = ttl ? { EX: ttl } : undefined;
            await this.client.set(fullKey, value, options);
        } catch (error: any) {
            this.logger.error(`Redis set failed for key ${key}: ${error.message}`);
            throw error;
        }
    }

    // Delete key
    public async delete(key: string): Promise<void> {
        try {
            await this.ensureConnection();
            if (!this.client) throw new Error("Redis client not connected");
            const fullKey = this.getPrefixedKey(key);
            await this.client.del(fullKey);
        } catch (error: any) {
            this.logger.error(`Redis delete failed for key ${key}: ${error.message}`);
            throw error;
        }
    }

    public async exists(key: string): Promise<boolean> {
        try {
            await this.ensureConnection();
            if (!this.client) throw new Error("Redis client not connected");
            const fullKey = this.getPrefixedKey(key);
            return (await this.client.exists(fullKey)) === 1;
        } catch (error: any) {
            this.logger.error(`Redis exists check failed for key ${key}: ${error.message}`);
            throw error;
        }
    }

    public async ping(): Promise<string> {
        try {
            await this.ensureConnection();
            if (!this.client) throw new Error("Redis client not connected");
            return await this.client.ping();
        } catch (error: any) {
            this.logger.error(`Redis ping failed: ${error.message}`);
            throw error;
        }
    }

    // Disconnect from Redis
    public async disconnect(): Promise<void> {
        try {
            if (this.client) {
                await this.client.quit();
                this.client = null;
                this.logger.info("Redis disconnected");
            }
        } catch (error: any) {
            this.logger.error(`Redis disconnect failed: ${error.message}`);
            throw error;
        }
    }

    // Flush all keys (use with caution)
    public async flushAll(): Promise<void> {
        try {
            await this.ensureConnection();
            if (!this.client) throw new Error("Redis client not connected");
            await this.client.flushAll();
            this.logger.warn("Redis cache flushed");
        } catch (error: any) {
            this.logger.error(`Redis flushAll failed: ${error.message}`);
            throw error;
        }
    }
}