/**
 *
 * MySQL Client module
 *
 * @packageDocumentation
 *
 */

import mysql from 'mysql2/promise';
import {log} from './log/index';

export type MySQLClientParams = {
  uri: string;
  use_pool?: boolean;
};

export class MySQLClient {
  public pool?: mysql.Pool;
  public main_connection: mysql.Connection | undefined;
  protected uri: string;
  constructor(params: MySQLClientParams) {
    this.uri = params.uri;
    if (params.use_pool === true) {
      this.pool = mysql.createPool({
        uri: params.uri,
        namedPlaceholders: true,
      });
    }
  }
  public async exe(sql: string, values?: any) {
    const with_values =
      typeof values !== 'undefined'
        ? ` with values [${Object.entries(values)}]`
        : '';
    log.trace(`Excuting query '${sql}'${with_values}...`);
    if (this.pool) {
      return await this._execute_from_pool_connection(sql, values);
    }
    if (!this.main_connection) {
      await this.connect();
    }
    const [rows, fields] = await this.main_connection!.execute(sql, values);
    return [rows, fields];
  }
  public async connect() {
    log.trace(`Connecting to MySQL database...`);
    this.main_connection = await mysql.createConnection({
      uri: this.uri,
      namedPlaceholders: true,
    });
    log.debug(`Connected to MySQL database`);
  }
  public async disconnect() {
    log.trace(`Disconnecting from MySQL database...`);
    await this.main_connection?.end();
    log.debug(`Disconnected from MySQL database`);
  }
  private async _execute_from_pool_connection(sql: string, values?: any) {
    if (!this.pool) {
      throw new Error(`Pool was not initialized`);
    }
    log.trace(`Retrieving pool connection...`);
    const pool_connection = await this.pool.getConnection();
    log.trace(`[${pool_connection.threadId}] Retrieved pool connection`);
    const [rows, fields] = await pool_connection.execute(sql, values);
    log.trace(`Releasing pool connection...`);
    pool_connection.release();
    log.trace(`[${pool_connection.threadId}] Released pool connection`);
    return [rows, fields];
  }
}
