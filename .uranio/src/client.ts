/**
 *
 * UranioClient module
 *
 * @packageDocumentation
 *
 */

import {MongoDBClient, MongoDBClientParams} from './client/mongodb';
import {MySQLClient, MySQLClientParams} from './client/mysql';

export class UranioMongoDBClient extends MongoDBClient {
  constructor(params: MongoDBClientParams) {
    super(params);
  }
}

export class UranioMySQLClient extends MySQLClient {
  constructor(params: MySQLClientParams) {
    super(params);
  }
}
