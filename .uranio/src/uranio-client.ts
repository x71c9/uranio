/**
 *
 * UranioClient module
 *
 * @packageDocumentation
 *
 */

import {MongoDBClient, MongoDBClientParams} from './mongodb-client';
import {MySQLClient, MySQLClientParams} from './mysql-client';

import {MongoDBAtomClient} from './mongodb-atom';
// import {MySQLAtomClient} from './mysql-atom';

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

