"use strict";
/**
 *
 * MongoDB Client module
 *
 * @packageDocumentation
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDBClient = void 0;
const mongodb_1 = require("mongodb");
const index_1 = require("../log/index");
class MongoDBClient {
    constructor(params) {
        const options = {
            serverApi: {
                version: mongodb_1.ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
            maxPoolSize: 10,
            minPoolSize: 0,
        };
        this.client = new mongodb_1.MongoClient(params.uri, options);
        this.db = this.client.db(params.db_name, { ignoreUndefined: true });
    }
    async connect() {
        try {
            // Check if the client is already connected by pinging the database
            await this.client.db().command({ ping: 1 });
            index_1.log.trace('MongoDB is already connected.');
        }
        catch (error) {
            index_1.log.trace('Connecting to MongoDB...');
            await this.client.connect();
            index_1.log.trace('MongoDB connected.');
        }
        // log.trace('Connecting...');
        // await this.client.connect();
        // log.trace('Connected.');
    }
    async disconnect() {
        index_1.log.trace('Disconnecting...');
        await this.client.close();
        index_1.log.trace('Disconnected.');
    }
}
exports.MongoDBClient = MongoDBClient;
//# sourceMappingURL=mongodb.js.map