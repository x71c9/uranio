/**
 *
 * MySQL Atom client module
 *
 */

// import mysql from 'mysql2/promise';

// import {log} from './log/index';

import {MySQLClient} from '../client/mysql';

// import {AtomClient} from './atom';

// import {atom, Query, Shape} from './types';

// export class MySQLAtomClient<S extends atom> implements AtomClient<S> {
export class MySQLAtomClient {
  constructor(
    public client: MySQLClient,
    public name: string
  ) {}

  // public async get_item(query: Query<S>): Promise<S | null> {
  //   const where = _convert_to_sql(query);
  // }

  // public async get_items(query: Query<S>): Promise<S[]> {}

  // public async put_item(shape: Shape<S>): Promise<any> {}

  // public async put_items(atoms: Shape<S>[]): Promise<any> {}

  // public async update_item(query: Query<S>, atom: Partial<S>): Promise<any> {}

  // public async update_items(query: Query<S>, atom: Partial<S>): Promise<any> {}

  // public async delete_item(query: Query<S>): Promise<any> {}

  // public async delete_items(query: Query<S>): Promise<any> {}
  
}
