"use strict";
/**
 *
 * UranioClient module
 *
 * @packageDocumentation
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.UranioMySQLClient = exports.UranioMongoDBClient = void 0;
const mongodb_1 = require("./client/mongodb");
const mysql_1 = require("./client/mysql");
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
//# sourceMappingURL=client.js.map