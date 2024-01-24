/**
 *
 * MySQL Atom client module
 *
 */
import { MySQLClient } from '../client/mysql';
import * as atom_types from '../types/atom';
import * as where_types from '../types/where';
import * as sql_types from '../types/sql';
export declare class MySQLAtomClient<S extends atom_types.mysql_atom> {
    client: MySQLClient;
    name: string;
    constructor(client: MySQLClient, name: string);
    get_atom(where: where_types.Where<S>): Promise<S | null>;
    get_atoms({ where, order, limit, }: {
        where?: where_types.Where<S>;
        order?: sql_types.OrderBy;
        limit?: string;
    }): Promise<S[]>;
    put_atom(shape: Partial<S>): Promise<any>;
    put_atoms(shapes: Partial<S>[]): Promise<any>;
    update_atoms(atom: Partial<S>, where?: where_types.Where<S>): Promise<any>;
    delete_atoms(where: where_types.Where<S>): Promise<any>;
}
