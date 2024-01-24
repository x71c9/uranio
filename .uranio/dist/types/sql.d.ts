/**
 *
 * SQL type module
 *
 * @packageDocumentation
 */
export declare const root_operators: readonly ["$and", "$nor", "$or"];
export declare const filter_operators: readonly ["$eq", "$gt", "$gte", "$in", "$lt", "$lte", "$ne", "$nin", "$not", "$exists"];
export type FilterOperator = (typeof filter_operators)[number];
export type RootOperator = (typeof root_operators)[number];
export type Operator = {
    [k in FilterOperator]: any;
};
export type OrderBy = {
    [k: string]: 'asc' | 'desc';
};
