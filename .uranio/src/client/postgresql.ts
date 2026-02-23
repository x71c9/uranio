/**
 *
 * PostgreSQL Client module
 *
 * @packageDocumentation
 *
 */

import {Pool, PoolClient} from 'pg';
import {log} from '../log/index';

export type PostgreSQLClientParams = {
  uri: string;
  usePool?: boolean;
};

export class PostgreSQLClient {
  public pool?: Pool;
  public mainConnection: PoolClient | undefined;
  protected uri: string;
  constructor(params: PostgreSQLClientParams) {
    this.uri = params.uri;
    if (params.usePool === true) {
      this.pool = new Pool({
        connectionString: params.uri,
      });
    }
  }
  public async exe(sql: string, values?: any) {
    // Convert named parameters object to positional parameters array
    const {query, paramValues} = this._convert_named_to_positional(sql, values);
    const with_values =
      typeof paramValues !== 'undefined' && paramValues.length > 0
        ? ` with values [${paramValues}]`
        : '';
    log.trace(`Excuting query '${query}'${with_values}`);
    if (this.pool) {
      return await this._execute_from_pool_connection(query, paramValues);
    }
    if (!this.mainConnection) {
      await this.connect();
    }
    const result = await this.mainConnection!.query(query, paramValues);
    return [result.rows, result.fields];
  }
  public async connect() {
    log.trace(`Connecting to PostgreSQL database...`);
    if (!this.pool) {
      this.pool = new Pool({
        connectionString: this.uri,
      });
    }
    this.mainConnection = await this.pool.connect();
    log.debug(`Connected to PostgreSQL database`);
  }
  public async disconnect() {
    log.trace(`Disconnecting from PostgreSQL database...`);
    if (this.mainConnection) {
      this.mainConnection.release();
      this.mainConnection = undefined;
    }
    if (this.pool) {
      await this.pool.end();
    }
    log.debug(`Disconnected from PostgreSQL database`);
  }
  private async _execute_from_pool_connection(sql: string, values?: any[]) {
    if (!this.pool) {
      throw new Error(`Pool was not initialized`);
    }
    log.trace(`Retrieving pool connection...`);
    const pool_connection = await this.pool.connect();
    log.trace(`Retrieved pool connection`);
    const result = await pool_connection.query(sql, values);
    log.trace(`Releasing pool connection...`);
    pool_connection.release();
    log.trace(`Released pool connection`);
    return [result.rows, result.fields];
  }
  private _convert_named_to_positional(
    sql: string,
    namedParams?: Record<string, any>
  ): {query: string; paramValues: any[]} {
    if (!namedParams || Object.keys(namedParams).length === 0) {
      return {query: sql, paramValues: []};
    }
    // Sort keys to ensure consistent ordering
    const sortedKeys = Object.keys(namedParams).sort();
    let paramIndex = 1;
    let convertedQuery = sql;
    const paramValues: any[] = [];

    // Replace each :paramName with $1, $2, etc.
    for (const key of sortedKeys) {
      const namedParam = `:${key}`;
      // Replace all occurrences of this named parameter
      while (convertedQuery.includes(namedParam)) {
        convertedQuery = convertedQuery.replace(namedParam, `$${paramIndex}`);
      }
      paramValues.push(namedParams[key]);
      paramIndex++;
    }

    return {query: convertedQuery, paramValues};
  }
}
