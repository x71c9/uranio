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
      },
    } as MongoClientOptions;
    this.client = new MongoClient(params.uri, options);
    this.db = this.client.db(params.db_name, {ignoreUndefined: true});
  }
  public async connect() {
    log.trace('Connecting...');
    await this.client.connect();
    log.trace('Connected.');
  }
  public async disconnect() {
    log.trace('Disconnecting...');
    await this.client.close();
    log.trace('Disconnected.');
  }
}
