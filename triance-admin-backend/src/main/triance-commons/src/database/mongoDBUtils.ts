import mongoose, { Mongoose, ConnectOptions, Document, Model, Schema } from "mongoose";
import { EnvUtils } from "../config";
import { LoggerUtils } from "../audit";

export class MongoDBUtils {
    private static instance: MongoDBUtils | null = null;
    private mongooseInstance: Mongoose | null = null;
    private logger = LoggerUtils.getLogger("MongoDBUtils");

    public static getInstance(): MongoDBUtils {
        if (!MongoDBUtils.instance) {
            MongoDBUtils.instance = new MongoDBUtils();
        }
        return MongoDBUtils.instance;
    }

    public async connect(): Promise<Mongoose> {
        try {
            const host = EnvUtils.getString("MONGODB_HOST", "localhost");
            const port = EnvUtils.getNumber("MONGODB_PORT", 27017);
            const connectionURI = `mongodb://${host}:${port}`;

            const options: ConnectOptions = {
                autoIndex: true,
                autoCreate: true,
                dbName: EnvUtils.getString("MONGODB_NAME", "admin"),
                authSource: EnvUtils.getString("MONGODB_AUTH_SOURCE", "admin"),
            };

            const username = EnvUtils.getString("MONGODB_USERNAME");
            const password = EnvUtils.getString("MONGODB_PASSWORD");

            if (username && password) {
                options.auth = { username, password };
            }

            const tlsCAFile = EnvUtils.getString("MONGODB_TLS_CA_FILE");
            const tlsCertificateKeyFile = EnvUtils.getString("MONGODB_TLS_CERTIFICATE_KEY_FILE");

            if (tlsCAFile && tlsCertificateKeyFile) {
                options.tls = true;
                options.tlsCAFile = tlsCAFile;
                options.tlsCertificateKeyFile = tlsCertificateKeyFile;
            }

            this.mongooseInstance = await mongoose.connect(connectionURI, options);
            this.logger.info(`Connected to MongoDB at ${connectionURI}`);

            return this.mongooseInstance;
        } catch (error: any) {
            this.logger.error(`Error connecting to MongoDB :: ${error.message} :: ${error}`);
            throw error;
        }
    }

    public async disconnect(): Promise<void> {
        try {
            if (this.mongooseInstance) {
                await this.mongooseInstance.disconnect();
                this.logger.info("Disconnected from MongoDB");
            }
        } catch (error: any) {
            this.logger.error(`Error disconnecting from MongoDB :: ${error.message} :: ${error}`);
            throw error;
        }
    }

    public getConnection(): Mongoose | null {
        try {
            return this.mongooseInstance;
        } catch (error: any) {
            this.logger.error(`Error getting MongoDB connection :: ${error.message} :: ${error}`);
            throw error;
        }
    }

    public createModel<T extends Document>(collectionName: string, schemaDefinition: Record<string, any>): Model<T> {
        try {
            const schema = new Schema(schemaDefinition);
            const model = mongoose.model<T>(collectionName, schema);
            this.logger.info(`Created model for collection: ${collectionName}`);
            return model;
        } catch (error: any) {
            this.logger.error(`Error creating model for collection ${collectionName} :: ${error.message} :: ${error}`);
            throw error;
        }
    }

    public async insertOne<T extends Document>(model: Model<T>, document: Partial<T>): Promise<T> {
        try {
            const newDocument = new model(document);
            const savedDocument = await newDocument.save();
            this.logger.info(`Inserted one document into collection ${model.collection.name}`);
            return savedDocument;
        } catch (error: any) {
            this.logger.error(`Error inserting one document into collection ${model.collection.name} :: ${error.message} :: ${error}`);
            throw error;
        }
    }

    public async insertMany<T extends Document>(model: Model<T>, documents: Partial<T>[]): Promise<void> {
        try {
            await model.insertMany(documents);
            this.logger.info(`Inserted multiple documents into collection ${model.collection.name}`);
        } catch (error: any) {
            this.logger.error(`Error inserting multiple documents into collection ${model.collection.name} :: ${error.message} :: ${error}`);
            throw error;
        }
    }

    public async findOne<T extends Document>(model: Model<T>, query: Record<string, any>): Promise<T | null> {
        try {
            const document = await model.findOne(query).exec();
            this.logger.info(`Found one document in collection ${model.collection.name}`);
            return document;
        } catch (error: any) {
            this.logger.error(`Error finding one document in collection ${model.collection.name} :: ${error.message} :: ${error}`);
            throw error;
        }
    }

    public async updateOne<T extends Document>(
        model: Model<T>,
        query: Record<string, any>,
        update: Record<string, any>,
        upsert: boolean = false
    ): Promise<void> {
        try {
            await model.updateOne(query, update, { upsert }).exec();
            this.logger.info(`${upsert ? 'Upserted' : 'Updated'} one document in collection ${model.collection.name}`);
        } catch (error: any) {
            this.logger.error(`Error ${upsert ? 'Upserting' : 'Updating'} one document in collection ${model.collection.name} :: ${error.message} :: ${error}`);
            throw error;
        }
    }

    public async updateMany<T extends Document>(
        model: Model<T>,
        query: Record<string, any>,
        update: Record<string, any>,
        upsert: boolean = false
    ): Promise<void> {
        try {
            await model.updateMany(query, update, { upsert }).exec();
            this.logger.info(`${upsert ? 'Upserted' : 'Updated'} multiple documents in collection ${model.collection.name}`);
        } catch (error: any) {
            this.logger.error(`Error ${upsert ? 'Upserting' : 'Updating'} multiple documents in collection ${model.collection.name} :: ${error.message} :: ${error}`);
            throw error;
        }
    }

    public async deleteOne<T extends Document>(model: Model<T>, query: Record<string, any>): Promise<void> {
        try {
            await model.deleteOne(query).exec();
            this.logger.info(`Deleted one document from collection ${model.collection.name}`);
        } catch (error: any) {
            this.logger.error(`Error deleting one document from collection ${model.collection.name} :: ${error.message} :: ${error}`);
            throw error;
        }
    }

    public async deleteMany<T extends Document>(model: Model<T>, query: Record<string, any>): Promise<void> {
        try {
            await model.deleteMany(query).exec();
            this.logger.info(`Deleted multiple documents from collection ${model.collection.name}`);
        } catch (error: any) {
            this.logger.error(`Error deleting multiple documents from collection ${model.collection.name} :: ${error.message} :: ${error}`);
            throw error;
        }
    }

    public async aggregate<T extends Document>(model: Model<T>, pipeline: any[]): Promise<any[]> {
        try {
            const result = await model.aggregate(pipeline).exec();
            this.logger.info(`Executed aggregation on collection ${model.collection.name}`);
            return result;
        } catch (error: any) {
            this.logger.error(`Error in aggregation :: ${error.message} :: ${error}`);
            throw error;
        }
    }

    public async distinct<T extends Document>(model: Model<T>, field: string, query: Record<string, any> = {}): Promise<any[]> {
        try {
            const distinctValues = await model.distinct(field, query).exec();
            this.logger.info(`Fetched distinct values for field ${field} in collection ${model.collection.name}`);
            return distinctValues;
        } catch (error: any) {
            this.logger.error(`Error in distinct :: ${error.message} :: ${error}`);
            throw error;
        }
    }

    public async count<T extends Document>(model: Model<T>, query: Record<string, any> = {}): Promise<number> {
        try {
            const count = await model.countDocuments(query).exec();
            this.logger.info(`Counted documents in collection ${model.collection.name}`);
            return count;
        } catch (error: any) {
            this.logger.error(`Error counting documents :: ${error.message} :: ${error}`);
            throw error;
        }
    }

    public async exists<T extends Document>(model: Model<T>, query: Record<string, any>): Promise<boolean> {
        try {
            const exists = await model.exists(query);
            this.logger.info(`Checked existence of document in collection ${model.collection.name}`);
            return !!exists;
        } catch (error: any) {
            this.logger.error(`Error checking existence of document :: ${error.message} :: ${error}`);
            throw error;
        }
    }

    public async findWithOptions<T extends Document>(
        model: Model<T>,
        query: Record<string, any>,
        options: { projection?: Record<string, any>; limit?: number; offset?: number; sort?: Record<string, any> } = {}
    ): Promise<T[]> {
        try {
            const { projection, limit, offset, sort } = options;
            const documents = await model
                .find(query, projection)
                .sort(sort)
                .skip(offset || 0)
                .limit(limit || 0)
                .exec();
            this.logger.info(`Fetched documents with options from collection ${model.collection.name}`);
            return documents;
        } catch (error: any) {
            this.logger.error(`Error in findWithOptions :: ${error.message} :: ${error}`);
            throw error;
        }
    }
}

export default MongoDBUtils;
