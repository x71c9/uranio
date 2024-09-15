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
        this.client = new mongodb_1.MongoClient(params.uri, {
            serverApi: {
                version: mongodb_1.ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
        });
        this.db = this.client.db(params.db_name);
    }
    async connect() {
        index_1.log.trace('Connecting...');
        await this.client.connect();
        index_1.log.trace('Connected.');
    }
    async disconnect() {
        index_1.log.trace('Disconnecting...');
        await this.client.close();
        index_1.log.trace('Disconnected.');
    }
}
exports.MongoDBClient = MongoDBClient;
//# sourceMappingURL=mongodb.js.map
