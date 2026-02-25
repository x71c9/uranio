/**
 *
 * JS Object to sql_types expanded query converter module
 *
 * @packageDocumentation
 *
 */

import * as atom_types from '../types/atom';
import * as where_types from '../types/where';
import * as sql_types from '../types/sql';

export function compose_select<S extends atom_types.atom>({
  projection = ['*'],
  table,
  where,
  order,
  limit,
}: {
  projection?: string[];
  table: string;
  where?: where_types.Where<S>;
  order?: sql_types.OrderBy;
  limit?: string;
}) {
  let query_string = 'SELECT';
  query_string += _resolve_projection(projection);
  query_string += ` FROM \`${table}\``;
  if (where && typeof where === 'object' && Object.entries(where).length > 0) {
    query_string += ` WHERE ` + _resolve_where<S>(where);
  }
  query_string += _resolve_order(order);
  query_string += _resolve_limit(limit);
  return query_string;
}

export function compose_update<S extends atom_types.atom>({
  table,
  update,
  where,
}: {
  table: string;
  update: Partial<S>;
  where?: where_types.Where<S>;
}) {
  let query_string = 'UPDATE';
  query_string += ` \`${table}\``;
  query_string += ` SET`;
  query_string += _resolve_update(update);
  query_string += ` WHERE ` + _resolve_where<S>(where);
  return query_string;
}

export function compose_delete<S extends atom_types.atom>({
  table,
  where,
}: {
  table: string;
  where?: where_types.Where<S>;
}) {
  let query_string = 'DELETE';
  query_string += ` FROM \`${table}\``;
  query_string += ` WHERE ` + _resolve_where<S>(where);
  return query_string;
}

export function compose_insert<S extends atom_types.atom>({
  table,
  columns,
  records,
}: {
  table: string;
  columns: (keyof S)[];
  records: Partial<S>[];
}) {
  let query_string = 'INSERT INTO';
  query_string += ` \`${table}\``;
  query_string += _resolve_columns(columns);
  query_string += _resolve_records(columns, records);
  return query_string;
}

function _resolve_where<S extends atom_types.atom>(
  where?: where_types.Where<S>,
): string {
  if (
    !where ||
    typeof where !== 'object' ||
    Object.entries(where).length === 0
  ) {
    return '';
  }
  const where_parts: string[] = [];
  // console.log(`where_types.Where param: ${JSON.stringify(where)}`);
  for (const [key, value] of Object.entries(where)) {
    // console.log(`Key: ${key}, Value: ${JSON.stringify(value)}`);
    if (sql_types.root_operators.includes(key as sql_types.RootOperator)) {
      // console.log(`Key is in root operators`);
      if (!Array.isArray(value)) {
        throw new Error(
          `Invalid Where. Root operator '${key}' must have an Array as value`,
        );
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
      query_string += '' + _resolve_filter(key, value as sql_types.Operator);
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

function _resolve_columns<S extends atom_types.atom>(
  columns: (keyof S)[],
): string {
  return ' (' + columns.map((el) => '`' + String(el) + '`').join(', ') + ')';
}

function _resolve_records<S extends atom_types.atom>(
  columns: (keyof S)[],
  records: Partial<S>[],
): string {
  const record_strings: string[] = [];
  for (let record of records) {
    const record_parts: string[] = [];
    for (let column of columns) {
      record_parts.push(_format_value(record[column]));
    }
    const joined_record = record_parts.join(', ');
    record_strings.push(joined_record);
  }
  const full_records = record_strings.map((el) => '(' + el + ')').join(', ');
  return ` VALUES ${full_records}`;
}

function _resolve_update<S extends atom_types.atom>(
  update: Partial<S>,
): string {
  const update_parts: string[] = [];
  for (const [key, value] of Object.entries(update)) {
    update_parts.push(`${key} = ${_format_value(value)}`);
  }
  return ' ' + update_parts.join(', ');
}

function _resolve_order(order?: sql_types.OrderBy): string {
  if (
    !order ||
    typeof order !== 'object' ||
    Object.entries(order).length === 0
  ) {
    return '';
  }

  // Security: Validate column names and directions to prevent SQL injection
  const VALID_COLUMN_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  const VALID_DIRECTIONS = ['asc', 'desc'];

  let query_string = '';
  let order_strings: string[] = [];

  for (const [column, direction] of Object.entries(order)) {
    // Validate column name (alphanumeric and underscore only)
    if (!VALID_COLUMN_REGEX.test(column)) {
      throw new Error(
        `Invalid column name in ORDER BY: "${column}". ` +
          `Column names must start with a letter or underscore and contain ` +
          ` only alphanumeric characters and underscores.`,
      );
    }

    // Validate direction
    const normalizedDirection = direction.toLowerCase();
    if (!VALID_DIRECTIONS.includes(normalizedDirection)) {
      throw new Error(
        `Invalid direction in ORDER BY: "${direction}". ` +
          `Must be "asc" or "desc".`,
      );
    }

    order_strings.push(`\`${column}\` ${normalizedDirection.toUpperCase()}`);
  }

  const final_order = order_strings.join(', ');
  query_string += ` ORDER BY ${final_order}`;
  return query_string;
}

function _resolve_projection(projection: string[]): string {
  let query_string = '';
  const projection_string = projection.join(', ');
  query_string += ` ${projection_string}`;
  return query_string;
}

function _resolve_limit(limit?: string): string {
  if (typeof limit !== 'string' || limit === '') {
    return '';
  }

  // Security: Validate LIMIT to prevent SQL injection
  // Supports: "10", "10,20" (MySQL offset), "10 OFFSET 20" (PostgreSQL)
  const limitPattern = /^(\d+)(?:\s*,\s*(\d+)|\s+OFFSET\s+(\d+))?$/i;
  const match = limit.match(limitPattern);

  if (!match) {
    throw new Error(
      `Invalid LIMIT clause: "${limit}". ` +
        `Must be a positive integer or "limit,offset" or "limit OFFSET offset".`,
    );
  }

  return ` LIMIT ${limit}`;
}

function _resolve_filter(column: string, operator: sql_types.Operator) {
  let filter_strings: string[] = [];
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
        filter_strings.push(
          `\`${column}\` NOT (${_resolve_filter(column, value)})`,
        );
        break;
      }
      case '$exists': {
        if (value === true) {
          filter_strings.push(`\`${column}\` IS NOT NULL`);
        } else {
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

function _format_value(value: unknown): string {
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
