/**
 *
 * UranioClient module
 *
 * @packageDocumentation
 *
 */
import { MongoDBClient, MongoDBClientParams } from './client/mongodb';
import { MySQLClient, MySQLClientParams } from './client/mysql';
import { DynamoDBClient, DynamoDBClientParams } from './client/dynamodb';
export declare class UranioMongoDBClient extends MongoDBClient {
    constructor(params: MongoDBClientParams);
}
export declare class UranioMySQLClient extends MySQLClient {
    constructor(params: MySQLClientParams);
}
export declare class UranioDynamoDBClient extends DynamoDBClient {
    constructor(params: DynamoDBClientParams);
}
