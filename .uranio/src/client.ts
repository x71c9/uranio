/**
 *
 * Client module
 *
 * @packageDocumentation
 *
 */

import mongodb, {MongoClient, ServerApiVersion} from 'mongodb';
import {log} from './log/index';

export type ClientParams = {
  uri: string;
  db_name: string;
};

export class Client{
  protected client: mongodb.MongoClient;
  protected db: mongodb.Db;
  constructor(params: ClientParams) {
    this.client = new MongoClient(params.uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    this.db = this.client.db(params.db_name);
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
