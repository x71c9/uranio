/**
 *
 * MongoDB Atom client module
 *
 */

import mongodb, {ObjectId} from 'mongodb';

import {atom, Where, Shape, AtomClient} from '../types';

export class MongoDBAtomClient<S extends atom> implements AtomClient<S> {
  public collection: mongodb.Collection<S>;

  constructor(
    private db: mongodb.Db,
    public name: string
  ) {
    this.collection = this.db.collection<S>(name);
  }

  public async get_item(where: Where<S>): Promise<S | null> {
    where = _instance_object_id(where);
    let item = await this.collection.findOne<S>(where as mongodb.Filter<S>);
    if (!item) {
      return null;
    }
    item = _string_id(item) as S;
    return item;
  }

  public async get_items(where: Where<S>): Promise<S[]> {
    where = _instance_object_id(where);
    let items = await this.collection
      .find<S>(where as mongodb.Filter<S>)
      .toArray();
    for (let item of items) {
      item = _string_id(item) as S;
    }
    return items;
  }

  public async put_item(shape: Shape<S>): Promise<mongodb.InsertOneResult> {
    shape = _remove_id(shape as Partial<S>);
    const respone_insert = await this.collection.insertOne(
      shape as mongodb.OptionalUnlessRequiredId<S>
    );
    return respone_insert;
  }

  public async put_items(atoms: Shape<S>[]): Promise<mongodb.InsertManyResult> {
    const atoms_no_ids: mongodb.OptionalUnlessRequiredId<S>[] = [];
    for (const atom of atoms) {
      const atom_no_id = _remove_id(
        atom as Partial<S>
      ) as mongodb.OptionalUnlessRequiredId<S>;
      atoms_no_ids.push(atom_no_id);
    }
    let items = await this.collection.insertMany(atoms_no_ids);
    return items;
  }

  public async update_item(
    where: Where<S>,
    atom: Partial<S>
  ): Promise<mongodb.UpdateResult> {
    where = _instance_object_id(where);
    atom = _remove_id(atom) as Partial<S>;
    const response_update = await this.collection.updateOne(
      where as mongodb.Filter<S>,
      {$set: atom}
    );
    return response_update;
  }

  public async update_items(
    where: Where<S>,
    atom: Partial<S>
  ): Promise<mongodb.UpdateResult> {
    where = _instance_object_id(where);
    atom = _remove_id(atom) as Partial<S>;
    const response_update = await this.collection.updateMany(
      where as mongodb.Filter<S>,
      {$set: atom}
    );
    return response_update;
  }

  public async delete_item(where: Where<S>): Promise<mongodb.DeleteResult> {
    where = _instance_object_id(where);
    const response_delete = await this.collection.deleteOne(
      where as mongodb.Filter<S>
    );
    return response_delete;
  }

  public async delete_items(where: Where<S>): Promise<mongodb.DeleteResult> {
    where = _instance_object_id(where);
    const response_delete = await this.collection.deleteMany(
      where as mongodb.Filter<S>
    );
    return response_delete;
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

function _remove_id<A extends atom>(atom: Partial<A>): Shape<A> {
  delete (atom as any)._id;
  return atom as Shape<A>;
}

function _instance_object_id<A extends atom>(where: Where<A>): Where<A> {
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
