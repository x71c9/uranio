/**
 *
 * MongoDB Client module
 *
 * @packageDocumentation
 *
 */

import mongodb, {
  MongoClient,
  MongoClientOptions,
  ServerApiVersion,
} from 'mongodb';
import {log} from '../log/index';

export type MongoDBClientParams = {
  uri: string;
  db_name: string;
};

export class MongoDBClient {
  protected client: mongodb.MongoClient;
  protected db: mongodb.Db;
  constructor(params: MongoDBClientParams) {
    const options = {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
        maxPoolSize: 10,
        minPoolSize: 0,
      },
    } as MongoClientOptions;
    this.client = new MongoClient(params.uri, options);
    this.db = this.client.db(params.db_name, {ignoreUndefined: true});
  }
  public async connect() {
    try {
      // Check if the client is already connected by pinging the database
      await this.client.db().command({ping: 1});
      log.trace('MongoDB is already connected.');
    } catch (error) {
      log.trace('Connecting to MongoDB...');
      await this.client.connect();
      log.trace('MongoDB connected.');
    }
    // log.trace('Connecting...');
    // await this.client.connect();
    // log.trace('Connected.');
  }
  public async disconnect() {
    log.trace('Disconnecting...');
    await this.client.close();
    log.trace('Disconnected.');
  }
}
