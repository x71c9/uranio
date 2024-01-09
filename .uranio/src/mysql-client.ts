/**
 *
 * MySQL Client module
 *
 * @packageDocumentation
 *
 */

// import mysql from 'mysql2';
import mysql from 'mysql2/promise';
// import {log} from './log/index';

export type MySQLClientParams = {
  uri: string;
};

export class MySQLClient {
  public pool: mysql.Pool;
  public mysql: typeof mysql;
  protected uri: string;
  protected main_connection: mysql.Connection | undefined;
  constructor(params: MySQLClientParams) {
    this.uri = params.uri;
    this.pool = mysql.createPool({
      uri: params.uri,
      namedPlaceholders: true,
    });
    this.mysql = mysql;
  }
  // public async exe(...args:Parameters<mysql.Connection['execute']>){
  public async exe(sql: string, values: any) {
    if (!this.main_connection) {
      await this.connect();
    }
    return await this.main_connection!.execute(sql, values);
  }
  public async connect() {
    this.main_connection = await this.mysql.createConnection({
      uri: this.uri,
      namedPlaceholders: true
    });
  }
  public async disconnect() {
    await this.main_connection?.end();
  }
  public async get_pool_connection() {
    const pool_connection = await this.pool.getConnection();
    return pool_connection;
  }
  public release_pool_connection(pool_connection: mysql.PoolConnection) {
    pool_connection.release();
  }
}
