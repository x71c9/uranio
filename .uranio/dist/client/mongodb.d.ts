/**
 *
 * MongoDB Client module
 *
 * @packageDocumentation
 *
 */
import mongodb from 'mongodb';
export type MongoDBClientParams = {
    uri: string;
    db_name: string;
};
export declare class MongoDBClient {
    protected client: mongodb.MongoClient;
    protected db: mongodb.Db;
    constructor(params: MongoDBClientParams);
    connect(): Promise<void>;
    disconnect(): Promise<void>;
}
