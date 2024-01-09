/**
 *
 * UranioClient module
 *
 * @packageDocumentation
 *
 */

import {MongoDBClient, MongoDBClientParams} from './mongodb-client';

import {MySQLClient, MySQLClientParams} from './mysql-client';

export class UranioMongoDBClient extends MongoDBClient{
  constructor(params: MongoDBClientParams) {
    super(params);
  }
}

export class UranioMySQLClient extends MySQLClient{
  constructor(params: MySQLClientParams) {
    super(params);
  }
}

