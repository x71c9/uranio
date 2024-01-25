/**
 *
 * MongoDB Atom client module
 *
 */

import mongodb, {ObjectId} from 'mongodb';

import * as atom_types from '../types/atom';
import * as sql_types from '../types/sql';
import * as where_types from '../types/where';

export class MongoDBAtomClient<S extends atom_types.mongodb_atom> {
  public collection: mongodb.Collection<S>;

  constructor(
    private db: mongodb.Db,
    public name: string
  ) {
    this.collection = this.db.collection<S>(name);
  }

  public async get_atom({
    where,
    order,
  }: {
    where?: where_types.Where<S>;
    order?: sql_types.OrderBy;
  }): Promise<S | null> {
    where = _instance_object_id(where);
    let item = await this.collection.findOne<S>(where as mongodb.Filter<S>, {
      sort: order,
    });
    if (!item) {
      return null;
    }
    // item = _string_id(item) as S;
    return item;
  }

  public async get_atoms({
    where,
    order,
    limit,
  }: {
    where?: where_types.Where<S>;
    order?: sql_types.OrderBy;
    limit?: number;
  }): Promise<S[]> {
    where = _instance_object_id(where);
    let items = await this.collection
      .find<S>(where as mongodb.Filter<S>, {sort: order, limit})
      .toArray();
    for (let item of items) {
      item = _string_id(item) as S;
    }
    return items;
  }

  public async put_atom(atom: Partial<S>): Promise<mongodb.InsertOneResult> {
    // shape = _remove_id(shape as Partial<S>);
    atom = _replace_string_id_to_object_id(atom);
    const respone_insert = await this.collection.insertOne(
      atom as mongodb.OptionalUnlessRequiredId<S>
    );
    return respone_insert;
  }

  public async put_atoms(
    atoms: Partial<S>[]
  ): Promise<mongodb.InsertManyResult> {
    const atoms_no_ids: mongodb.OptionalUnlessRequiredId<S>[] = [];
    for (const atom of atoms) {
      // const atom_no_id = _remove_id(
      //   atom as Partial<S>
      // ) as mongodb.OptionalUnlessRequiredId<S>;
      const atom_no_id = _replace_string_id_to_object_id(
        atom
      ) as mongodb.OptionalUnlessRequiredId<S>;
      atoms_no_ids.push(atom_no_id);
    }
    let items = await this.collection.insertMany(atoms_no_ids);
    return items;
  }

  public async update_atom({
    where,
    atom,
  }: {
    where?: where_types.Where<S>;
    atom: Partial<S>;
  }): Promise<mongodb.UpdateResult> {
    where = _instance_object_id(where);
    // atom = _remove_id(atom) as Partial<S>;
    atom = _replace_string_id_to_object_id(atom) as Partial<S>;
    const response_update = await this.collection.updateOne(
      where as mongodb.Filter<S>,
      {$set: atom}
    );
    return response_update;
  }

  public async update_atoms({
    where,
    atom,
  }: {
    where?: where_types.Where<S>;
    atom: Partial<S>;
  }): Promise<mongodb.UpdateResult> {
    where = _instance_object_id(where);
    // atom = _remove_id(atom) as Partial<S>;
    atom = _replace_string_id_to_object_id(atom) as Partial<S>;
    const response_update = await this.collection.updateMany(
      where as mongodb.Filter<S>,
      {$set: atom}
    );
    return response_update;
  }

  public async delete_atom({
    where,
  }: {
    where?: where_types.Where<S>;
  }): Promise<mongodb.DeleteResult> {
    where = _instance_object_id(where);
    const response_delete = await this.collection.deleteOne(
      where as mongodb.Filter<S>
    );
    return response_delete;
  }

  public async delete_atoms({
    where,
  }: {
    where?: where_types.Where<S>;
  }): Promise<mongodb.DeleteResult> {
    where = _instance_object_id(where);
    const response_delete = await this.collection.deleteMany(
      where as mongodb.Filter<S>
    );
    return response_delete;
  }

  public async get_random_atom({where}: {where?: where_types.Where<S>}) {
    // https://www.mongodb.com/docs/manual/reference/operator/aggregation/sample/
    const sample_stage = {$sample: {size: 1}};
    const stages: mongodb.BSON.Document[] = [];
    where = _instance_object_id(where);
    if (where && Object.keys(where).length > 0) {
      stages.push({$match: where});
    }
    stages.push(sample_stage);
    const cursor = this.collection.aggregate(stages);
    const [response] = await cursor.toArray();
    return response;
  }
}

type StringId<T extends unknown> = T extends {_id: any}
  ? Omit<T, '_id'> & {_id: string}
  : T;

function _string_id<T extends unknown>(item: T): StringId<T> {
  if (item && typeof item === 'object' && '_id' in item) {
    if (item._id?.toString) {
      item._id = item._id.toString();
    }
    item._id = String(item._id);
  }
  return item as StringId<T>;
}

// function _remove_id<A extends atom_types.mongodb_atom>(
//   atom: Partial<A>
// ): atom_types.Shape<A> {
//   delete (atom as any)._id;
//   return atom as atom_types.Shape<A>;
// }

function _replace_string_id_to_object_id<A extends atom_types.mongodb_atom>(
  atom: Partial<A>
): Partial<A> {
  if (atom._id && typeof atom._id === 'string') {
    atom._id = new ObjectId(atom._id) as any;
  }
  return atom;
}

function _instance_object_id<A extends atom_types.mongodb_atom>(
  where?: where_types.Where<A>
): where_types.Where<A> | undefined {
  if (!where) {
    return where;
  }
  for (let [key, value] of Object.entries(where)) {
    if (key === '_id' && typeof value === 'string') {
      where['_id'] = new ObjectId(value) as any;
    }
    if (value && typeof value === 'object') {
      value = _instance_object_id(value);
    }
  }
  return where;
}
