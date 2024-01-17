/**
 *
 * JS Object to SQL expanded query converter module
 *
 * @packageDocumentation
 *
 */

import * as t from '../types/index';

export function compose_select<S extends t.atom>({
  projection = ['*'],
  table,
  where,
  order,
  limit,
}: {
  projection?: string[];
  table: string;
  where?: t.Where<S>;
  order?: t.OrderBy;
  limit?: string;
}) {
  let query_string = 'SELECT';
  query_string += _resolve_projection(projection);
  query_string += ` FROM \`${table}\``;
  if(where && typeof where === 'object' && Object.entries(where).length > 0){
    query_string += ` WHERE ` + _resolve_where<S>(where);
  }
  query_string += _resolve_order(order);
  query_string += _resolve_limit(limit);
  return query_string;
}

export function compose_update<S extends t.atom>({
  table,
  update,
  where,
}: {
  table: string;
  update: Partial<S>;
  where?: t.Where<S>;
}) {
  let query_string = 'UPDATE';
  query_string += ` \`${table}\``;
  query_string += ` SET`;
  query_string += _resolve_update(update);
  query_string += ` WHERE ` + _resolve_where<S>(where);
  return query_string;
}

export function compose_delete<S extends t.atom>({
  table,
  where,
}: {
  table: string;
  where?: t.Where<S>;
}) {
  let query_string = 'DELETE';
  query_string += ` FROM \`${table}\``;
  query_string += ` WHERE ` + _resolve_where<S>(where);
  return query_string;
}

export function compose_insert<S extends t.atom>({
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

function _resolve_where<S extends t.atom>(where?: t.Where<S>): string {
  if (
    !where ||
    typeof where !== 'object' ||
    Object.entries(where).length === 0
  ) {
    return '';
  }
  const where_parts: string[] = [];
  // console.log(`t.Where param: ${JSON.stringify(where)}`);
  for (const [key, value] of Object.entries(where)) {
    // console.log(`Key: ${key}, Value: ${JSON.stringify(value)}`);
    if (t.root_operators.includes(key as t.RootOperator)) {
      // console.log(`Key is in root operators`);
      if (!Array.isArray(value)) {
        throw new Error(
          `Invalid t.Where. Root operator '${key}' must have an Array as value`
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
      // console.log(`t.Where parts: ${where_parts}`);
      const final_where = where_parts.join(` AND `);
      return final_where;
    }
    // if (filter_operators.includes(key as FilterOperator)) {
    //   throw new Error(
    //     `Invalid key. Key cannot be equal to an operator. Using '${key}'`
    //   );
    // }
    if(value instanceof RegExp){
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
      query_string += '' + _resolve_filter(key, value as t.Operator);
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

function _resolve_columns<S extends t.atom>(columns: (keyof S)[]): string {
  return ' (' + columns.map((el) => '`' + String(el) + '`').join(', ') + ')';
}

function _resolve_records<S extends t.atom>(
  columns: (keyof S)[],
  records: Partial<S>[]
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

function _resolve_update<S extends t.atom>(update: Partial<S>): string {
  const update_parts: string[] = [];
  for (const [key, value] of Object.entries(update)) {
    update_parts.push(`${key} = ${_format_value(value)}`);
  }
  return ' ' + update_parts.join(', ');
}

function _resolve_order(order?: t.OrderBy): string {
  if (
    !order ||
    typeof order !== 'object' ||
    Object.entries(order).length === 0
  ) {
    return '';
  }
  let query_string = '';
  let order_strings: string[] = [];
  for (const [column, direction] of Object.entries(order)) {
    order_strings.push(`\`${column}\` ${direction.toUpperCase()}`);
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
  return ` LIMIT ${limit}`;
}

function _resolve_filter(column: string, operator: t.Operator) {
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
          `\`${column}\` NOT (${_resolve_filter(column, value)})`
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
  if(value instanceof RegExp){
    return value.source;
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
//   throw new Error(`Invalid SQL type`);
// }
