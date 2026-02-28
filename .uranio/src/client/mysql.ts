/**
 *
 * MySQL Client module
 *
 * @packageDocumentation
 *
 */

import mysql from 'mysql2/promise';
import {log} from '../log/index';
import {SQLStatement} from '../sql/template';

export type MySQLClientParams = {
  uri: string;
  usePool?: boolean;
  timezone?: string;
};

export class MySQLClient {
  public pool?: mysql.Pool;
  public mainConnection: mysql.Connection | undefined;
  protected uri: string;
  protected timezone: string;
  constructor(params: MySQLClientParams) {
    this.uri = params.uri;
    this.timezone = params.timezone || '+00:00';
    if (params.usePool === true) {
      this.pool = mysql.createPool({
        uri: params.uri,
        namedPlaceholders: true,
        timezone: this.timezone,
      });
    }
  }
  public async exe(sql: string | SQLStatement, values?: any): Promise<any[]> {
    // Handle SQLStatement objects
    if (sql instanceof SQLStatement) {
      const {sql: query, values: params} = sql.mysql();
      return this.exe(query, params);
    }

    const with_values =
      typeof values !== 'undefined'
        ? ` with values [${Object.entries(values)}]`
        : '';
    log.trace(`Excuting query '${sql}'${with_values}`);
    if (this.pool) {
      return await this._execute_from_pool_connection(sql, values);
    }
    if (!this.mainConnection) {
      await this.connect();
    }
    // NOTE: For some reason they removed the execute method from the typescript
    // declaration file. The execute method is still in the javascript
    const [rows, fields] = await (this.mainConnection as any).execute(sql, values);
    return [rows, fields];
  }
  public async connect() {
    log.trace(`Connecting to MySQL database...`);
    this.mainConnection = await mysql.createConnection({
      uri: this.uri,
      namedPlaceholders: true,
      timezone: this.timezone,
    });
    log.debug(`Connected to MySQL database`);
  }
  public async disconnect() {
    log.trace(`Disconnecting from MySQL database...`);
    await this.mainConnection?.end();
    log.debug(`Disconnected from MySQL database`);
  }
  private async _execute_from_pool_connection(sql: string, values?: any) {
    if (!this.pool) {
      throw new Error(`Pool was not initialized`);
    }
    log.trace(`Retrieving pool connection...`);
    const pool_connection = await this.pool.getConnection();
    log.trace(`[${pool_connection.threadId}] Retrieved pool connection`);
    // NOTE: For some reason they removed the execute method from the typescript
    // declaration file. The execute method is still in the javascript
    const [rows, fields] = await (pool_connection as any).execute(sql, values);
    log.trace(`Releasing pool connection...`);
    pool_connection.release();
    log.trace(`[${pool_connection.threadId}] Released pool connection`);
    return [rows, fields];
  }
}
