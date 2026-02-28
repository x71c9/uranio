/**
 * Simplified SQL query builder
 * Much simpler than full_query.ts + param_query.ts
 *
 * Key differences:
 * - Uses template literals internally (no string replacement bugs)
 * - Direct parameterization (no two-stage conversion)
 * - Each value gets its own parameter (no duplicate value issues)
 *
 * @packageDocumentation
 */

import {SQL, SQLStatement} from './template';
import * as atom_types from '../types/atom';
import * as where_types from '../types/where';
import * as sql_types from '../types/sql';

/**
 * Build a SELECT query
 */
export function select<S extends atom_types.atom>({
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
}): SQLStatement {
  // Start with SELECT columns FROM table
  const cols = projection.join(', ');
  let query = new SQLStatement([`SELECT ${cols} FROM \`${table}\``], []);

  // Add WHERE clause
  if (where && Object.keys(where).length > 0) {
    const whereStmt = _where(where);
    query.append(' WHERE ').append(whereStmt);
  }

  // Add ORDER BY
  if (order && Object.keys(order).length > 0) {
    query.append(_orderBy(order));
  }

  // Add LIMIT
  if (limit) {
    query.append(_limit(limit));
  }

  return query;
}

/**
 * Build an INSERT query
 */
export function insert<S extends atom_types.atom>({
  table,
  columns,
  records,
}: {
  table: string;
  columns: (keyof S)[];
  records: Partial<S>[];
}): SQLStatement {
  const colNames = columns.map(c => `\`${String(c)}\``).join(', ');
  let query = new SQLStatement([`INSERT INTO \`${table}\` (${colNames}) VALUES `], []);

  // Add each record as (?, ?, ?) with actual values
  for (let i = 0; i < records.length; i++) {
    if (i > 0) query.append(', ');

    query.append('(');
    for (let j = 0; j < columns.length; j++) {
      if (j > 0) query.append(', ');
      const col = columns[j];
      const rec = records[i];
      if (rec && col) {
        const value = rec[col];
        query.append(SQL`${value}`);
      }
    }
    query.append(')');
  }

  return query;
}

/**
 * Build an UPDATE query
 */
export function update<S extends atom_types.atom>({
  table,
  update,
  where,
}: {
  table: string;
  update: Partial<S>;
  where?: where_types.Where<S>;
}): SQLStatement {
  let query = new SQLStatement([`UPDATE \`${table}\` SET `], []);

  // Add SET clause
  const keys = Object.keys(update);
  for (let i = 0; i < keys.length; i++) {
    if (i > 0) query.append(', ');
    const key = keys[i];
    if (key) {
      const value = (update as any)[key];
      query.append(`${key} = `).append(SQL`${value}`);
    }
  }

  // Add WHERE clause
  if (where) {
    query.append(' WHERE ').append(_where(where));
  }

  return query;
}

/**
 * Build a DELETE query
 */
export function del<S extends atom_types.atom>({
  table,
  where,
}: {
  table: string;
  where?: where_types.Where<S>;
}): SQLStatement {
  let query = new SQLStatement([`DELETE FROM \`${table}\``], []);

  if (where) {
    query.append(' WHERE ').append(_where(where));
  }

  return query;
}

/**
 * Build WHERE clause
 */
function _where<S extends atom_types.atom>(where: where_types.Where<S>): SQLStatement {
  const parts: SQLStatement[] = [];

  for (const [key, value] of Object.entries(where)) {
    // Root operators: $and, $or, $nor
    if (sql_types.root_operators.includes(key as sql_types.RootOperator)) {
      if (!Array.isArray(value)) {
        throw new Error(`Root operator '${key}' must have an Array as value`);
      }

      const subclauses = value.map(el => _where(el));
      const op = key === '$and' ? ' AND ' : key === '$or' ? ' OR ' : ' NOR ';

      let combined = new SQLStatement(['('], []);
      const firstClause = subclauses[0];
      if (firstClause) {
        combined.append(firstClause);
      }
      for (let i = 1; i < subclauses.length; i++) {
        const clause = subclauses[i];
        if (clause) {
          combined.append(op).append(clause);
        }
      }
      combined.append(')');
      parts.push(combined);
      continue;
    }

    // RegExp
    if (value instanceof RegExp) {
      parts.push(new SQLStatement([`\`${key}\` REGEXP `], []).append(SQL`${value.source}`));
      continue;
    }

    // Filter operators: {age: {$gte: 18}}
    if (value && typeof value === 'object' && !(value instanceof Date)) {
      if (Object.keys(value).length === 0) {
        throw new Error('Cannot compare to empty object value');
      }
      parts.push(_filter(key, value as sql_types.Operator));
      continue;
    }

    // Simple equality
    parts.push(new SQLStatement([`\`${key}\` = `], []).append(SQL`${value}`));
  }

  // Join with AND
  if (parts.length === 0) {
    return new SQLStatement([''], []);
  }
  let result = parts[0]!;
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (part) {
      result.append(' AND ').append(part);
    }
  }
  return result;
}

/**
 * Build filter operators like {$gte: 18, $lte: 65}
 */
function _filter(column: string, operator: sql_types.Operator): SQLStatement {
  const parts: SQLStatement[] = [];

  for (const [key, value] of Object.entries(operator)) {
    switch (key) {
      case '$eq':
        parts.push(new SQLStatement([`\`${column}\` = `], []).append(SQL`${value}`));
        break;
      case '$gt':
        parts.push(new SQLStatement([`\`${column}\` > `], []).append(SQL`${value}`));
        break;
      case '$gte':
        parts.push(new SQLStatement([`\`${column}\` >= `], []).append(SQL`${value}`));
        break;
      case '$lt':
        parts.push(new SQLStatement([`\`${column}\` < `], []).append(SQL`${value}`));
        break;
      case '$lte':
        parts.push(new SQLStatement([`\`${column}\` <= `], []).append(SQL`${value}`));
        break;
      case '$ne':
        parts.push(new SQLStatement([`\`${column}\` <> `], []).append(SQL`${value}`));
        break;
      case '$in':
        if (Array.isArray(value) && value.length > 0) {
          let stmt = new SQLStatement([`\`${column}\` IN (`], []);
          stmt.append(SQL`${value[0]}`);
          for (let i = 1; i < value.length; i++) {
            stmt.append(', ').append(SQL`${value[i]}`);
          }
          stmt.append(')');
          parts.push(stmt);
        }
        break;
      case '$nin':
        if (Array.isArray(value) && value.length > 0) {
          let stmt = new SQLStatement([`\`${column}\` NOT IN (`], []);
          stmt.append(SQL`${value[0]}`);
          for (let i = 1; i < value.length; i++) {
            stmt.append(', ').append(SQL`${value[i]}`);
          }
          stmt.append(')');
          parts.push(stmt);
        }
        break;
      case '$exists':
        const suffix = value === true ? ' IS NOT NULL' : ' IS NULL';
        parts.push(new SQLStatement([`\`${column}\`${suffix}`], []));
        break;
      case '$not':
        const notClause = _filter(column, value);
        parts.push(new SQLStatement([`\`${column}\` NOT (`], []).append(notClause).append(')'));
        break;
      default:
        throw new Error(`Invalid filter operator: ${key}`);
    }
  }

  // Join with AND
  if (parts.length === 0) {
    return new SQLStatement([''], []);
  }
  let result = parts[0]!;
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (part) {
      result.append(' AND ').append(part);
    }
  }
  return result;
}

/**
 * Build ORDER BY clause (returns plain string - no params)
 */
function _orderBy(order: sql_types.OrderBy): string {
  const VALID_COLUMN = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
  const VALID_DIR = ['asc', 'desc'];

  const parts: string[] = [];
  for (const [col, dir] of Object.entries(order)) {
    if (!VALID_COLUMN.test(col)) {
      throw new Error(`Invalid column name in ORDER BY: "${col}"`);
    }
    const normalized = dir.toLowerCase();
    if (!VALID_DIR.includes(normalized)) {
      throw new Error(`Invalid direction in ORDER BY: "${dir}"`);
    }
    parts.push(`\`${col}\` ${normalized.toUpperCase()}`);
  }

  return ` ORDER BY ${parts.join(', ')}`;
}

/**
 * Build LIMIT clause (returns plain string - no params)
 */
function _limit(limit: string): string {
  const pattern = /^(\d+)(?:\s*,\s*(\d+)|\s+OFFSET\s+(\d+))?$/i;
  if (!pattern.test(limit)) {
    throw new Error(`Invalid LIMIT clause: "${limit}"`);
  }
  return ` LIMIT ${limit}`;
}
