/**
 *
 * UranioClient module
 *
 * @packageDocumentation
 *
 */

import {MongoDBClient, MongoDBClientParams} from './client/mongodb';
import {MySQLClient, MySQLClientParams} from './client/mysql';

import {MongoDBAtomClient} from './atom/mongodb';
import {MySQLAtomClient} from './atom/mysql';

import * as t from './types/index';

type MongoPippo = {
  _id: t.primary<string>;
  age: number;
  name: string;
};

type MySQLPippo = {
  id: t.primary<number>;
  age: number;
  name: string;
};

export class UranioMongoDBClient extends MongoDBClient {
  public pippo: MongoDBAtomClient<MongoPippo>;
  constructor(params: MongoDBClientParams) {
    super(params);
    this.pippo = new MongoDBAtomClient<MongoPippo>(this.db, 'pippo');
  }
}

export class UranioMySQLClient extends MySQLClient {
  public pippo: MySQLAtomClient<MySQLPippo>;
  constructor(params: MySQLClientParams) {
    super(params);
    this.pippo = new MySQLAtomClient(this, 'pippo');
  }
}
