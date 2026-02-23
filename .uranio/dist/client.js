"use strict";
/**
 *
 * UranioClient module
 *
 * @packageDocumentation
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UranioDynamoDBClient = exports.UranioMySQLClient = exports.UranioMongoDBClient = void 0;
const mongodb_1 = require("./client/mongodb");
const mysql_1 = require("./client/mysql");
const dynamodb_1 = require("./client/dynamodb");
class UranioMongoDBClient extends mongodb_1.MongoDBClient {
    constructor(params) {
        super(params);
    }
}
exports.UranioMongoDBClient = UranioMongoDBClient;
class UranioMySQLClient extends mysql_1.MySQLClient {
    constructor(params) {
        super(params);
    }
}
exports.UranioMySQLClient = UranioMySQLClient;
class UranioDynamoDBClient extends dynamodb_1.DynamoDBClient {
    constructor(params) {
        super(params);
    }
}
exports.UranioDynamoDBClient = UranioDynamoDBClient;
//# sourceMappingURL=client.js.map