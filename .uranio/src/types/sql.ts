/**
 *
 * SQL type module
 *
 * @packageDocumentation
 */

export const root_operators = ['$and', '$nor', '$or'] as const;

export const filter_operators = [
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

export type FilterOperator = (typeof filter_operators)[number];

export type RootOperator = (typeof root_operators)[number];

export type Operator = {
  [k in FilterOperator]: any;
};

export type OrderBy = {
  [k: string]: 'asc' | 'desc';
};

