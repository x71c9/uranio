"use strict";
/**
 *
 * JS Object to SQL parametrized query converter module
 *
 * @packageDocumentation
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
exports.compose_select = compose_select;
exports.compose_update = compose_update;
exports.compose_delete = compose_delete;
exports.compose_insert = compose_insert;
// import crypto from 'crypto';
const full = __importStar(require("./full_query"));
const sql_types = __importStar(require("../types/sql"));
function compose_select({ projection = ['*'], table, where, order, limit, }) {
    // console.log(projection, table, JSON.stringify(where), order, limit);
    const full_query = full.compose_select({
        projection,
        table,
        where,
        order,
        limit,
    });
    const value_map = _generate_value_map_from_query(where);
    const param_query = _replace_value_with_param(full_query, value_map);
    const map = _transform_map_to_object(value_map);
    return { query: param_query, map };
}
function compose_update({ table, update, where, }) {
    const full_query = full.compose_update({
        table,
        update,
        where,
    });
    const query_value_map = _generate_value_map_from_query(where);
    const update_value_map = _generate_value_map_from_update(update);
    for (const [k, v] of update_value_map) {
        query_value_map.set(k, v);
    }
    const param_query = _replace_value_with_param(full_query, query_value_map);
    const map = _transform_map_to_object(query_value_map);
    return { query: param_query, map };
}
function compose_delete({ table, where, }) {
    const full_query = full.compose_delete({
        table,
        where,
    });
    const query_value_map = _generate_value_map_from_query(where);
    const param_query = _replace_value_with_param(full_query, query_value_map);
    const map = _transform_map_to_object(query_value_map);
    return { query: param_query, map };
}
function compose_insert({ table, columns, records, }) {
    const full_query = full.compose_insert({
        table,
        columns,
        records
    });
    const value_map = _generate_value_map_from_records(columns, records);
    const param_query = _replace_value_with_param(full_query, value_map);
    const map = _transform_map_to_object(value_map);
    return { query: param_query, query_records: map };
}
let id_count = 0;
function _generate_unique_consecutive_id() {
    const id = `x${String(id_count).padStart(4, '0')}`;
    id_count++;
    return id;
}
// function _generate_unique_id(): string {
//   const now = Date.now();
//   const hash = crypto.createHash('sha256');
//   hash.update(now.toString());
//   const digested = hash.digest('hex');
//   return 'x' + digested.substring(0, 3) + _generate_random_string(4);
// }
function _generate_value_map_from_update(update) {
    const value_map = new Map();
    for (const [_key, value] of Object.entries(update)) {
        const id = _generate_unique_consecutive_id();
        value_map.set(id, value);
    }
    return value_map;
}
function _generate_value_map_from_records(columns, records) {
    const value_map = new Map();
    for (const record of records) {
        for (const column of columns) {
            const value = record[column];
            const id = _generate_unique_consecutive_id();
            value_map.set(id, value);
        }
    }
    return value_map;
}
function _generate_value_map_from_query(where) {
    const value_map = new Map();
    if (!where) {
        return value_map;
    }
    for (const [key, value] of Object.entries(where)) {
        // key is a root operator: $and, $or, ...
        if (sql_types.root_operators.includes(key)) {
            // console.log(`Key is in Root Operator: [${key}]`);
            if (!Array.isArray(value)) {
                throw new Error(`Invalid t.Where. Root operator '${key}' must have an Array as value`);
            }
            const sub_maps = value.map((el) => _generate_value_map_from_query(el));
            for (const sub_map of sub_maps) {
                for (const [_k, v] of sub_map) {
                    const id = _generate_unique_consecutive_id();
                    value_map.set(id, v);
                }
            }
            continue;
        }
        // value is a RegExp
        if (value instanceof RegExp) {
            const id = _generate_unique_consecutive_id();
            value_map.set(id, value);
            continue;
        }
        // value is an object therefor is a filter: {$gt: 2, $lt: 20}
        if (value && typeof value === 'object') {
            if (Object.entries(value).length === 0) {
                throw new Error(`Cannot compare to empty object value`);
            }
            const filter_map = _generate_map_from_filter(
            // key,
            value);
            for (const [_k, v] of filter_map) {
                const id = _generate_unique_consecutive_id();
                value_map.set(id, v);
            }
            continue;
        }
        // key value are a simple equality: {foo: 123}
        const id = _generate_unique_consecutive_id();
        value_map.set(id, value);
    }
    return value_map;
}
function _generate_map_from_filter(
// key: string,
filter) {
    const filter_map = new Map();
    for (const [_operator, v] of Object.entries(filter)) {
        const id = _generate_unique_consecutive_id();
        filter_map.set(id, v);
    }
    return filter_map;
}
function _replace_value_with_param(full_query, value_map) {
    let final_query = full_query;
    for (const [k, v] of value_map) {
        if (Array.isArray(v)) {
            for (const array_value of v) {
                const map = new Map();
                map.set('a', array_value);
                final_query = _replace_value_with_param(final_query, map);
            }
            continue;
        }
        if (v instanceof RegExp) {
            final_query = final_query.replaceAll(` ${v.source}`, ` :${k}`);
            continue;
        }
        if (v instanceof Date) {
            const placeholder = `__DATE_PLACEHOLDER_${v.getTime()}__`;
            final_query = final_query.replaceAll(` ${placeholder}`, ` :${k}`);
            continue;
        }
        switch (typeof v) {
            case 'string': {
                final_query = final_query.replaceAll(`"${v}"`, `:${k}`);
                break;
            }
            default: {
                final_query = final_query.replaceAll(` ${v}`, ` :${k}`);
            }
        }
    }
    return final_query;
}
function _transform_map_to_object(map) {
    const object_map = Object.fromEntries(map);
    for (const [k, v] of Object.entries(object_map)) {
        if (v instanceof RegExp) {
            object_map[k] = v.source;
        }
    }
    return object_map;
}
// function _generate_random_string(length = 7): string {
//   const characters =
//     'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//   let result = '';
//   for (let i = 0; i < length; i++) {
//     const randomIndex = Math.floor(Math.random() * characters.length);
//     result += characters.charAt(randomIndex);
//   }
//   return result;
// }
//# sourceMappingURL=param_query.js.map