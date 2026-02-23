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
    getAtom(where: where_types.Where<S>): Promise<S | null>;
    getAtoms({ where, order, limit, }: {
        where?: where_types.Where<S>;
        order?: sql_types.OrderBy;
        limit?: string;
    }): Promise<S[]>;
    putAtom(shape: Partial<S>): Promise<any>;
    putAtoms(shapes: Partial<S>[]): Promise<any>;
    updateAtoms(atom: Partial<S>, where?: where_types.Where<S>): Promise<any>;
    deleteAtoms(where: where_types.Where<S>): Promise<any>;
}
