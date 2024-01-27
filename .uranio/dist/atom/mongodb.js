"use strict";
/**
 *
 * MongoDB Atom client module
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoDBAtomClient = void 0;
const mongodb_1 = require("mongodb");
class MongoDBAtomClient {
    constructor(db, name) {
        this.db = db;
        this.name = name;
        this.collection = this.db.collection(name);
    }
    async get_atom({ where, order, }) {
        where = _instance_object_id(where);
        let item = await this.collection.findOne(where, {
            sort: order,
        });
        if (!item) {
            return null;
        }
        // item = _string_id(item) as S;
        return item;
    }
    async get_atoms({ where, order, limit, }) {
        where = _instance_object_id(where);
        let items = await this.collection
            .find(where, { sort: order, limit })
            .toArray();
        // for (let item of items) {
        //   item = _string_id(item) as S;
        // }
        return items;
    }
    async put_atom(atom) {
        // shape = _remove_id(shape as Partial<S>);
        atom = _replace_string_id_to_object_id(atom);
        const respone_insert = await this.collection.insertOne(atom);
        return respone_insert;
    }
    async put_atoms(atoms) {
        const atoms_no_ids = [];
        for (const atom of atoms) {
            // const atom_no_id = _remove_id(
            //   atom as Partial<S>
            // ) as mongodb.OptionalUnlessRequiredId<S>;
            const atom_no_id = _replace_string_id_to_object_id(atom);
            atoms_no_ids.push(atom_no_id);
        }
        let items = await this.collection.insertMany(atoms_no_ids);
        return items;
    }
    async update_atom({ where, atom, }) {
        where = _instance_object_id(where);
        // atom = _remove_id(atom) as Partial<S>;
        atom = _replace_string_id_to_object_id(atom);
        const response_update = await this.collection.updateOne(where, { $set: atom });
        return response_update;
    }
    async update_atoms({ where, atom, }) {
        where = _instance_object_id(where);
        // atom = _remove_id(atom) as Partial<S>;
        atom = _replace_string_id_to_object_id(atom);
        const response_update = await this.collection.updateMany(where, { $set: atom });
        return response_update;
    }
    async delete_atom({ where, }) {
        where = _instance_object_id(where);
        const response_delete = await this.collection.deleteOne(where);
        return response_delete;
    }
    async delete_atoms({ where, }) {
        where = _instance_object_id(where);
        const response_delete = await this.collection.deleteMany(where);
        return response_delete;
    }
    async get_random_atom({ where }) {
        // https://www.mongodb.com/docs/manual/reference/operator/aggregation/sample/
        const sample_stage = { $sample: { size: 1 } };
        const stages = [];
        where = _instance_object_id(where);
        if (where && Object.keys(where).length > 0) {
            stages.push({ $match: where });
        }
        stages.push(sample_stage);
        const cursor = this.collection.aggregate(stages);
        const [response] = await cursor.toArray();
        if (!response) {
            return null;
        }
        return response;
    }
}
exports.MongoDBAtomClient = MongoDBAtomClient;
// type StringId<T extends unknown> = T extends {_id: any}
//   ? Omit<T, '_id'> & {_id: string}
//   : T;
// function _string_id<T extends unknown>(item: T): StringId<T> {
//   if (item && typeof item === 'object' && '_id' in item) {
//     if (item._id?.toString) {
//       item._id = item._id.toString();
//     }
//     item._id = String(item._id);
//   }
//   return item as StringId<T>;
// }
// function _remove_id<A extends atom_types.mongodb_atom>(
//   atom: Partial<A>
// ): atom_types.Shape<A> {
//   delete (atom as any)._id;
//   return atom as atom_types.Shape<A>;
// }
function _replace_string_id_to_object_id(atom) {
    if (atom._id && typeof atom._id === 'string') {
        atom._id = new mongodb_1.ObjectId(atom._id);
    }
    return atom;
}
function _instance_object_id(where) {
    if (!where) {
        return where;
    }
    for (let [key, value] of Object.entries(where)) {
        if (key === '_id' && typeof value === 'string') {
            where['_id'] = new mongodb_1.ObjectId(value);
        }
        if (value && typeof value === 'object') {
            value = _instance_object_id(value);
        }
    }
    return where;
}
//# sourceMappingURL=mongodb.js.map