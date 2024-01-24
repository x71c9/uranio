/**
 *
 * MongoDB Atom client module
 *
 */
import mongodb from 'mongodb';
import * as atom_types from '../types/atom';
import * as sql_types from '../types/sql';
import * as where_types from '../types/where';
export declare class MongoDBAtomClient<S extends atom_types.mongodb_atom> {
    private db;
    name: string;
    collection: mongodb.Collection<S>;
    constructor(db: mongodb.Db, name: string);
    get_atom({ where, order, }: {
        where?: where_types.Where<S>;
        order?: sql_types.OrderBy;
    }): Promise<S | null>;
    get_atoms({ where, order, limit, }: {
        where?: where_types.Where<S>;
        order?: sql_types.OrderBy;
        limit?: number;
    }): Promise<S[]>;
    put_atom(atom: Partial<S>): Promise<mongodb.InsertOneResult>;
    put_atoms(atoms: Partial<S>[]): Promise<mongodb.InsertManyResult>;
    update_atom({ where, atom, }: {
        where?: where_types.Where<S>;
        atom: Partial<S>;
    }): Promise<mongodb.UpdateResult>;
    update_atoms({ where, atom, }: {
        where?: where_types.Where<S>;
        atom: Partial<S>;
    }): Promise<mongodb.UpdateResult>;
    delete_atom({ where, }: {
        where?: where_types.Where<S>;
    }): Promise<mongodb.DeleteResult>;
    delete_atoms({ where, }: {
        where?: where_types.Where<S>;
    }): Promise<mongodb.DeleteResult>;
}
