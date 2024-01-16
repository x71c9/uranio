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
// import {MySQLAtomClient} from './atom/mysql';

type Pippo = {
  _id: string
}

export class UranioMongoDBClient extends MongoDBClient{
  public pippo: MongoDBAtomClient<Pippo>;
  constructor(params: MongoDBClientParams) {
    super(params);
    this.pippo = new MongoDBAtomClient<Pippo>(this.db, 'pippo');
  }
}

export class UranioMySQLClient extends MySQLClient{
  // public pippo: MySQLAtomClient<Pippo>;
  constructor(params: MySQLClientParams) {
    super(params);
    // this.pippo = new MySQLAtomClient(this, 'pippo');
  }
}

