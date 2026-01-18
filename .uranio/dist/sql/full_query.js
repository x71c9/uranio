"use strict";
/**
 *
 * JS Object to sql_types expanded query converter module
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
const sql_types = __importStar(require("../types/sql"));
function compose_select({ projection = ['*'], table, where, order, limit, }) {
    let query_string = 'SELECT';
    query_string += _resolve_projection(projection);
    query_string += ` FROM \`${table}\``;
    if (where && typeof where === 'object' && Object.entries(where).length > 0) {
        query_string += ` WHERE ` + _resolve_where(where);
    }
    query_string += _resolve_order(order);
    query_string += _resolve_limit(limit);
    return query_string;
}
function compose_update({ table, update, where, }) {
    let query_string = 'UPDATE';
    query_string += ` \`${table}\``;
    query_string += ` SET`;
    query_string += _resolve_update(update);
    query_string += ` WHERE ` + _resolve_where(where);
    return query_string;
}
function compose_delete({ table, where, }) {
    let query_string = 'DELETE';
    query_string += ` FROM \`${table}\``;
    query_string += ` WHERE ` + _resolve_where(where);
    return query_string;
}
function compose_insert({ table, columns, records, }) {
    let query_string = 'INSERT INTO';
    query_string += ` \`${table}\``;
    query_string += _resolve_columns(columns);
    query_string += _resolve_records(columns, records);
    return query_string;
}
function _resolve_where(where) {
    if (!where ||
        typeof where !== 'object' ||
        Object.entries(where).length === 0) {
        return '';
    }
    const where_parts = [];
    // console.log(`where_types.Where param: ${JSON.stringify(where)}`);
    for (const [key, value] of Object.entries(where)) {
        // console.log(`Key: ${key}, Value: ${JSON.stringify(value)}`);
        if (sql_types.root_operators.includes(key)) {
            // console.log(`Key is in root operators`);
            if (!Array.isArray(value)) {
                throw new Error(`Invalid Where. Root operator '${key}' must have an Array as value`);
            }
            const queries = value.map((el) => _resolve_where(el));
            // console.log(`Queries: ${queries}`);
            switch (key) {
                case '$and': {
                    const joined_queries = queries.join(' AND ');
                    where_parts.push(`(${joined_queries})`);
                    break;
                }
                case '$or': {
                    const joined_queries = queries.join(' OR ');
                    where_parts.push(`(${joined_queries})`);
                    break;
                }
                case '$nor': {
                    const joined_queries = queries.join(' NOR ');
                    where_parts.push(`(${joined_queries})`);
                    break;
                }
                default: {
                    throw new Error(`Invalid root operator`);
                }
            }
            // console.log(`where_types.Where parts: ${where_parts}`);
            const final_where = where_parts.join(` AND `);
            return final_where;
        }
        // if (filter_operators.includes(key as FilterOperator)) {
        //   throw new Error(
        //     `Invalid key. Key cannot be equal to an operator. Using '${key}'`
        //   );
        // }
        if (value instanceof RegExp) {
            let query_string = `\`${key}\``;
            query_string += ` REGEXP ` + _format_value(value);
            where_parts.push(query_string);
            continue;
        }
        if (value && typeof value === 'object') {
            // console.log(`Type of value is object --> using filter operator...`);
            if (Object.entries(value).length === 0) {
                throw new Error(`Cannot compare to empty object value`);
            }
            let query_string = '';
            query_string += '' + _resolve_filter(key, value);
            where_parts.push(query_string);
            continue;
        }
        let query_string = `\`${key}\``;
        query_string += ` = ` + _format_value(value);
        where_parts.push(query_string);
    }
    const final_where = where_parts.map((el) => `${el}`).join(` AND `);
    return final_where;
}
function _resolve_columns(columns) {
    return ' (' + columns.map((el) => '`' + String(el) + '`').join(', ') + ')';
}
function _resolve_records(columns, records) {
    const record_strings = [];
    for (let record of records) {
        const record_parts = [];
        for (let column of columns) {
            record_parts.push(_format_value(record[column]));
        }
        const joined_record = record_parts.join(', ');
        record_strings.push(joined_record);
    }
    const full_records = record_strings.map((el) => '(' + el + ')').join(', ');
    return ` VALUES ${full_records}`;
}
function _resolve_update(update) {
    const update_parts = [];
    for (const [key, value] of Object.entries(update)) {
        update_parts.push(`${key} = ${_format_value(value)}`);
    }
    return ' ' + update_parts.join(', ');
}
function _resolve_order(order) {
    if (!order ||
        typeof order !== 'object' ||
        Object.entries(order).length === 0) {
        return '';
    }
    let query_string = '';
    let order_strings = [];
    for (const [column, direction] of Object.entries(order)) {
        order_strings.push(`\`${column}\` ${direction.toUpperCase()}`);
    }
    const final_order = order_strings.join(', ');
    query_string += ` ORDER BY ${final_order}`;
    return query_string;
}
function _resolve_projection(projection) {
    let query_string = '';
    const projection_string = projection.join(', ');
    query_string += ` ${projection_string}`;
    return query_string;
}
function _resolve_limit(limit) {
    if (typeof limit !== 'string' || limit === '') {
        return '';
    }
    return ` LIMIT ${limit}`;
}
function _resolve_filter(column, operator) {
    let filter_strings = [];
    for (let [key, value] of Object.entries(operator)) {
        switch (key) {
            case '$eq': {
                filter_strings.push(`\`${column}\` = ${_format_value(value)}`);
                break;
            }
            case '$gt': {
                filter_strings.push(`\`${column}\` > ${_format_value(value)}`);
                break;
            }
            case '$gte': {
                filter_strings.push(`\`${column}\` >= ${_format_value(value)}`);
                break;
            }
            case '$in': {
                filter_strings.push(`\`${column}\` IN ${_format_value(value)}`);
                break;
            }
            case '$lt': {
                filter_strings.push(`\`${column}\` < ${_format_value(value)}`);
                break;
            }
            case '$lte': {
                filter_strings.push(`\`${column}\` <= ${_format_value(value)}`);
                break;
            }
            case '$ne': {
                filter_strings.push(`\`${column}\` <> ${_format_value(value)}`);
                break;
            }
            case '$nin': {
                filter_strings.push(`\`${column}\` NOT IN ${_format_value(value)}`);
                break;
            }
            // Recursive
            case '$not': {
                filter_strings.push(`\`${column}\` NOT (${_resolve_filter(column, value)})`);
                break;
            }
            case '$exists': {
                if (value === true) {
                    filter_strings.push(`\`${column}\` IS NOT NULL`);
                }
                else {
                    filter_strings.push(`\`${column}\` IS NULL`);
                }
                break;
            }
            default: {
                throw new Error(`Invalid filter operator`);
            }
        }
    }
    const filter_string = filter_strings.join(` AND `);
    return filter_string;
}
function _format_value(value) {
    let query_string = '';
    if (Array.isArray(value)) {
        return `(${value.toString()})`;
    }
    if (value instanceof RegExp) {
        return value.source;
    }
    if (value instanceof Date) {
        // Return a unique placeholder that won't conflict with the date string
        return `__DATE_PLACEHOLDER_${value.getTime()}__`;
    }
    switch (typeof value) {
        case 'string': {
            query_string = `"${value.replaceAll('"', '"')}"`;
            return query_string;
        }
        default: {
            return String(value);
        }
    }
}
// function _is_projection_type(type: unknown): boolean {
//   if (projection_type.includes(type as ProjectionType)) {
//     return true;
//   }
//   return false;
// }
// function _is_order_type(type: unknown): boolean {
//   if (order_type.includes(type as ProjectionType)) {
//     return true;
//   }
//   return false;
// }
// function _is_limit_type(type: unknown): boolean {
//   if (limit_type.includes(type as ProjectionType)) {
//     return true;
//   }
//   return false;
// }
// function _is_from_type(type: unknown): boolean {
//   if (from_type.includes(type as FromType)) {
//     return true;
//   }
//   return false;
// }
// function _assert_type(type: unknown): asserts type is SQLType {
//   if (sql_type.includes(type as SQLType)) {
//     return;
//   }
//   throw new Error(`Invalid sql_types type`);
// }
//# sourceMappingURL=full_query.js.map