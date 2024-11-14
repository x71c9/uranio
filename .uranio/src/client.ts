/**
 *
 * UranioClient module
 *
 * @packageDocumentation
 *
 */

import {MongoDBClient, MongoDBClientParams} from './client/mongodb';
import {MySQLClient, MySQLClientParams} from './client/mysql';
import {DynamoDBClient, DynamoDBClientParams} from './client/dynamodb';

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

export class UranioDynamoDBClient extends DynamoDBClient {
  constructor(params: DynamoDBClientParams) {
    super(params);
  }
}
