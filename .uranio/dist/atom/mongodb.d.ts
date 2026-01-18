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
    getAtom({ where, order, }: {
        where?: where_types.Where<S>;
        order?: sql_types.OrderBy;
    }): Promise<S | null>;
    getAtoms({ where, order, limit, }: {
        where?: where_types.Where<S>;
        order?: sql_types.OrderBy;
        limit?: number;
    }): Promise<S[]>;
    putAtom(atom: Omit<S, '_id'>): Promise<mongodb.InsertOneResult>;
    putAtoms(atoms: Omit<S, '_id'>[]): Promise<mongodb.InsertManyResult>;
    updateAtom({ where, atom, }: {
        where?: where_types.Where<S>;
        atom: Partial<S>;
    }): Promise<mongodb.UpdateResult>;
    updateAtoms({ where, atom, }: {
        where?: where_types.Where<S>;
        atom: Partial<S>;
    }): Promise<mongodb.UpdateResult>;
    deleteAtom({ where, }: {
        where?: where_types.Where<S>;
    }): Promise<mongodb.DeleteResult>;
    deleteAtoms({ where, }: {
        where?: where_types.Where<S>;
    }): Promise<mongodb.DeleteResult>;
    getRandomAtom({ where }: {
        where?: where_types.Where<S>;
    }): Promise<S | null>;
}
