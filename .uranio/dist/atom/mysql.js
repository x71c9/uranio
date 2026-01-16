"use strict";
/**
 *
 * MySQL Atom client module
 *
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MySQLAtomClient = void 0;
const sql = __importStar(require("../sql/index"));
class MySQLAtomClient {
    constructor(client, name) {
        this.client = client;
        this.name = name;
    }
    async get_atom(where) {
        const { query, map } = sql.param.compose_select({
            table: this.name,
            where,
            limit: '1',
        });
        const [rows] = await this.client.exe(query, map);
        if (Array.isArray(rows) && rows[0]) {
            return rows[0];
        }
        return null;
    }
    async get_atoms({ where, order, limit, }) {
        const { query, map } = sql.param.compose_select({
            table: this.name,
            where,
            order,
            limit,
        });
        const [rows] = await this.client.exe(query, map);
        if (Array.isArray(rows)) {
            return rows;
        }
        return [];
    }
    async put_atom(shape) {
        const columns = [];
        for (const [key, _] of Object.entries(shape)) {
            columns.push(key);
        }
        const { query, query_records } = sql.param.compose_insert({
            table: this.name,
            columns,
            records: [shape]
        });
        const response = await this.client.exe(query, query_records);
        return response;
    }
    async put_atoms(shapes) {
        const columns = [];
        if (!Array.isArray(shapes) || shapes.length < 1 || !shapes[0]) {
            return null;
        }
        for (const [key, _] of Object.entries(shapes[0])) {
            columns.push(key);
        }
        const { query, query_records } = sql.param.compose_insert({
            table: this.name,
            columns,
            records: shapes
        });
        const response = await this.client.exe(query, query_records);
        return response;
    }
    async update_atoms(atom, where) {
        const { query, map } = sql.param.compose_update({
            table: this.name,
            where,
            update: atom
        });
        const response = await this.client.exe(query, map);
        return response;
    }
    async delete_atoms(where) {
        const { query, map } = sql.param.compose_delete({
            table: this.name,
            where,
        });
        const response = await this.client.exe(query, map);
        return response;
    }
}
exports.MySQLAtomClient = MySQLAtomClient;
//# sourceMappingURL=mysql.js.map