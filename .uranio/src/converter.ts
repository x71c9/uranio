/**
 *
 * JS Object to SQL query converter module
 *
 * @packageDocumentation
 *
 */

import {atom, Query} from './types';

const root_operators = ['$and', '$nor', '$or'] as const;

const filter_operators = [
  '$eq',
  '$gt',
  '$gte',
  '$in',
  '$lt',
  '$lte',
  '$ne',
  '$nin',
  '$not',
  '$exists',
] as const;

type FilterOperator = (typeof filter_operators)[number];

type RootOperator = typeof root_operators[number];

type Operator = {
  [k in FilterOperator]: any
}

type OrderBy = {
  [k:string]: 'asc' | 'desc'
}

type SQLType = 'select' | 'update' | 'delete';

export function generate_sql<S extends atom>({
  type,
  projection = ['*'],
  table,
  query,
  order,
  limit,
}: {
  type: SQLType;
  projection?: string[];
  table: string;
  query?: Query<S>;
  order?: OrderBy;
  limit?: number;
}) {
  let query_string = '';
  query_string += type.toUpperCase();
  if (Array.isArray(projection) && projection.length > 0) {
    const projection_string = projection.join(', ');
    query_string += ` ${projection_string}`;
  }
  query_string += ` FROM \`${table}\``;
  if (query && typeof query === 'object' && Object.entries(query).length > 0) {
    query_string += ' WHERE ' + _resolve_query<S>(query);
  }
  if (order) {
    let order_strings:string[] = [];
    for(const [column, direction] of Object.entries(order)){
      order_strings.push(`\`${column}\` ${direction.toUpperCase()}`);
    }
    const final_order = order_strings.join(', ');
    query_string += ` ORDER BY ${final_order}`;
  }
  if (limit) {
    query_string += ` LIMIT ${limit}`;
  }
  return query_string;
}

function _resolve_query<S extends atom>(query: Query<S>): string {
  const query_parts: string[] = [];
  console.log(`Query param: ${JSON.stringify(query)}`);
  for (const [key, value] of Object.entries(query)) {
    
    console.log(`Key: ${key}, Value: ${JSON.stringify(value)}`);
    
    if (root_operators.includes(key as RootOperator)) {
      
      console.log(`Key is in root operators`);
      
      if (!Array.isArray(value)) {
        throw new Error(
          `Invalid Query. Root operator '${key}' must have an Array as value`
        );
      }

      const queries = value.map((el) => _resolve_query(el));
      console.log(`Queries: ${queries}`);

      switch (key) {
        case '$and': {
          const joined_queries = queries.join(' AND ');
          query_parts.push(`(${joined_queries})`);
          break;
        }
        case '$or': {
          const joined_queries = queries.join(' OR ');
          query_parts.push(`(${joined_queries})`);
          break;
        }
        case '$nor': {
          const joined_queries = queries.join(' NOR ');
          query_parts.push(`(${joined_queries})`);;
          break;
        }
        default: {
          throw new Error(`Invalid root operator`);
        }
      }
      
      console.log(`Query parts: ${query_parts}`);
      const final_query = query_parts.join(` AND `);
      return final_query;
      
    }
    
    // if (filter_operators.includes(key as FilterOperator)) {
    //   throw new Error(
    //     `Invalid key. Key cannot be equal to an operator. Using '${key}'`
    //   );
    // }
    
    if (value && typeof value === 'object') {

      console.log(`Type of value is object --> using filter operator...`);

      if (Object.entries(value).length === 0) {
        throw new Error(`Cannot compare to empty object value`);
      }
      
      let query_string = '';
      query_string += '' + _resolve_filter(key, value as Operator);
      query_parts.push(query_string);
      continue;
    }
    
    let query_string = `\`${key}\``;
    query_string += ` = ` + _format_value(value);
    query_parts.push(query_string);
    
  }
  const final_query = query_parts.map(el => `${el}`).join(` AND `);
  return final_query;
}

function _resolve_filter(column: string, operator: Operator) {
  let filter_strings:string [] = [];
  for(let [key, value] of Object.entries(operator)){
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
        if(value === true){
          filter_strings.push(`\`${column}\` IS NOT NULL`);
        }else{
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

function _format_value(value: unknown): string{
  let query_string = '';
  if(Array.isArray(value)){
    return `[${value.toString()}]`;
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
