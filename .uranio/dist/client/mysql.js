"use strict";
/**
 *
 * MySQL Client module
 *
 * @packageDocumentation
 *
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySQLClient = void 0;
const promise_1 = __importDefault(require("mysql2/promise"));
const index_1 = require("../log/index");
class MySQLClient {
    constructor(params) {
        this.uri = params.uri;
        this.timezone = params.timezone || '+00:00';
        if (params.use_pool === true) {
            this.pool = promise_1.default.createPool({
                uri: params.uri,
                namedPlaceholders: true,
                timezone: this.timezone,
            });
        }
    }
    async exe(sql, values) {
        const with_values = typeof values !== 'undefined'
            ? ` with values [${Object.entries(values)}]`
            : '';
        index_1.log.trace(`Excuting query '${sql}'${with_values}`);
        if (this.pool) {
            return await this._execute_from_pool_connection(sql, values);
        }
        if (!this.main_connection) {
            await this.connect();
        }
        // NOTE: For some reason they removed the execute method from the typescript
        // declaration file. The execute method is still in the javascript
        const [rows, fields] = await this.main_connection.execute(sql, values);
        return [rows, fields];
    }
    async connect() {
        index_1.log.trace(`Connecting to MySQL database...`);
        this.main_connection = await promise_1.default.createConnection({
            uri: this.uri,
            namedPlaceholders: true,
            timezone: this.timezone,
        });
        index_1.log.debug(`Connected to MySQL database`);
    }
    async disconnect() {
        var _a;
        index_1.log.trace(`Disconnecting from MySQL database...`);
        await ((_a = this.main_connection) === null || _a === void 0 ? void 0 : _a.end());
        index_1.log.debug(`Disconnected from MySQL database`);
    }
    async _execute_from_pool_connection(sql, values) {
        if (!this.pool) {
            throw new Error(`Pool was not initialized`);
        }
        index_1.log.trace(`Retrieving pool connection...`);
        const pool_connection = await this.pool.getConnection();
        index_1.log.trace(`[${pool_connection.threadId}] Retrieved pool connection`);
        // NOTE: For some reason they removed the execute method from the typescript
        // declaration file. The execute method is still in the javascript
        const [rows, fields] = await pool_connection.execute(sql, values);
        index_1.log.trace(`Releasing pool connection...`);
        pool_connection.release();
        index_1.log.trace(`[${pool_connection.threadId}] Released pool connection`);
        return [rows, fields];
    }
}
exports.MySQLClient = MySQLClient;
//# sourceMappingURL=mysql.js.map