"use strict";
/**
 *
 * DynamoDB Client module
 *
 * @packageDocumentation
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBClient = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
class DynamoDBClient {
    constructor(params) {
        this.client = new client_dynamodb_1.DynamoDBClient({ region: params.region });
        this.tableName = params.tableName;
    }
}
exports.DynamoDBClient = DynamoDBClient;
//# sourceMappingURL=dynamodb.js.map