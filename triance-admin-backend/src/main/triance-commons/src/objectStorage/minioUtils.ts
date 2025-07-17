import { Client } from "minio";
import { LoggerUtils } from "../audit";
import { EnvUtils } from "../config";
import { CacheTTL } from "../enums";

export class MinioUtils {
    private minioClient: Client | null = null;
    private logger = LoggerUtils.getLogger("MinioUtils");
    private minioEnabled: boolean = EnvUtils.getBoolean("MINIO_ENABLED", false);
    private endPoint: string = EnvUtils.getString("MINIO_ENDPOINT")
    private port: number = EnvUtils.getNumber("MINIO_PORT", 9000);
    private useSSL: boolean = EnvUtils.getBoolean("MINIO_ENABLE_SSL", false);
    private accessKey: string = EnvUtils.getString("MINIO_ACCESS_KEY");
    private secretKey: string = EnvUtils.getString("MINIO_SECRET_KEY");
    private static instance: MinioUtils | null = null;

    constructor() {
        if (this.minioEnabled) {
            this.minioClient = new Client({
                endPoint: this.endPoint,
                port: this.port,
                useSSL: this.useSSL,
                accessKey: this.accessKey,
                secretKey: this.secretKey,
            });
        }
    }

    public static getInstance(): MinioUtils {
        if (!MinioUtils.instance) {
            MinioUtils.instance = new MinioUtils();
        }
        return MinioUtils.instance;
    }

    private checkClient(): void {
        if (!this.minioClient) {
            throw new Error("Minio client is not initialized.");
        }
    }

    public async listBuckets(): Promise<any> {
        try {
            this.checkClient();
            const buckets = await this.minioClient?.listBuckets();
            this.logger.info("listBuckets :: Retrieved buckets successfully");
            return buckets;
        } catch (error: any) {
            this.logger.error(`listBuckets :: Error retrieving buckets :: ${error}`);
            throw error;
        }
    }

    public async makeBucket(bucketName: string): Promise<any> {
        try {
            this.checkClient();
            await this.minioClient?.makeBucket(bucketName);
            this.logger.info(`makeBucket :: Created bucket "${bucketName}" successfully`);
        } catch (error: any) {
            this.logger.error(`makeBucket :: Error creating bucket "${bucketName}" :: ${error}`);
            throw error;
        }
    }

    public async getObject(bucketName: string, objectName: string): Promise<Buffer | undefined> {
        try {
            this.checkClient();
            const chunks: Buffer[] = [];

            const stream = await this.minioClient?.getObject(bucketName, objectName);
            if (!stream) return;

            return new Promise<Buffer>((resolve, reject) => {
                stream.on("data", (chunk: Buffer) => chunks.push(chunk));
                stream.on("end", () => resolve(Buffer.concat(chunks)));
                stream.on("error", (err: any) => reject(err));
            });

        } catch (error: any) {
            this.logger.error(`getObject :: Error retrieving object "${objectName}" from bucket "${bucketName}" :: ${error}`);
            throw error;
        }
    }


    public async putObject(bucketName: string, objectName: string, data: any): Promise<any> {
        try {
            this.checkClient();
            await this.minioClient?.putObject(bucketName, objectName, data);
            this.logger.info(`putObject :: Successfully put object "${objectName}" to bucket "${bucketName}"`);
        } catch (error: any) {
            this.logger.error(`putObject :: Error putting object "${objectName}" to bucket "${bucketName}" :: ${error}`);
            throw error;
        }
    }

    public async presignedGetObject(
        bucketName: string,
        objectName: string,
        expiry: CacheTTL = CacheTTL.LONG
    ): Promise<string | undefined> {
        try {
            this.checkClient();
            return await this.minioClient?.presignedGetObject(bucketName, objectName, expiry);
        } catch (error: any) {
            this.logger.error(`presignedGetObject :: Error generating presigned URL for object "${objectName}" from bucket "${bucketName}" :: ${error}`);
            throw error;
        }
    }
}
