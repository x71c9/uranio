/**
 *
 * JS Object to SQL parametrized query converter module
 *
 * @packageDocumentation
 *
 */
import * as atom_types from '../types/atom';
import * as where_types from '../types/where';
import * as sql_types from '../types/sql';
export declare function compose_select<S extends atom_types.atom>({ projection, table, where, order, limit, }: {
    projection?: string[];
    table: string;
    where?: where_types.Where<S>;
    order?: sql_types.OrderBy;
    limit?: string;
}): {
    query: string;
    map: Record<string, any>;
};
export declare function compose_update<S extends atom_types.atom>({ table, update, where, }: {
    table: string;
    update: Partial<S>;
    where?: where_types.Where<S>;
}): {
    query: string;
    map: Record<string, any>;
};
export declare function compose_delete<S extends atom_types.atom>({ table, where, }: {
    table: string;
    where?: where_types.Where<S>;
}): {
    query: string;
    map: Record<string, any>;
};
export declare function compose_insert<S extends atom_types.atom>({ table, columns, records, }: {
    table: string;
    columns: (keyof S)[];
    records: Partial<S>[];
}): {
    query: string;
    query_records: Record<string, any>;
};
