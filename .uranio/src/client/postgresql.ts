/**
 *
 * PostgreSQL Client module
 *
 * @packageDocumentation
 *
 */

import {Pool, PoolClient} from 'pg';
import {log} from '../log/index';
import {SQLStatement} from '../sql/template';

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
  public async exe(sql: string | SQLStatement, values?: any): Promise<any[]> {
    const {query, paramValues} = this._prepare(sql, values);
    const with_values =
      typeof paramValues !== 'undefined' && paramValues.length > 0
        ? ` with values [${paramValues}]`
        : '';
    log.debug(`Excuting query '${query}'${with_values}`);
    if (this.pool) {
      return await this._execute_from_pool_connection(query, paramValues);
    }
    if (!this.mainConnection) {
      await this.connect();
    }
    const result = await this.mainConnection!.query(query, paramValues);
    return [result.rows, result.fields];
  }
  /**
   * Turns any accepted input into a PostgreSQL query plus a positional values
   * array:
   * - a SQLStatement is already positional ($1…$n) and its values are used as
   *   they are;
   * - a string with a values array is used as it is;
   * - a string with a named-parameters object goes through
   *   _convert_named_to_positional.
   * An array must never reach the named conversion: it would take the indexes
   * as keys and sort them as strings ("0", "1", "10", "11", "2", …), which
   * reorders the values of every statement with more than ten parameters.
   */
  protected _prepare(
    sql: string | SQLStatement,
    values?: any,
  ): {query: string; paramValues: any[]} {
    if (sql instanceof SQLStatement) {
      const {sql: query, values: params} = sql.postgres();
      return {query: query.replace(/`/g, '"'), paramValues: params};
    }
    if (Array.isArray(values)) {
      return {query: sql.replace(/`/g, '"'), paramValues: values};
    }
    return this._convert_named_to_positional(sql, values);
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
    // Convert MySQL backticks to PostgreSQL double quotes
    let convertedQuery = sql.replace(/`/g, '"');

    if (!namedParams || Object.keys(namedParams).length === 0) {
      return {query: convertedQuery, paramValues: []};
    }

    // Sort keys to ensure consistent ordering
    const sortedKeys = Object.keys(namedParams).sort();
    const paramValues: any[] = [];
    const keyToIndexMap = new Map<string, number>();

    // Map each named parameter to its positional index
    for (const key of sortedKeys) {
      const value = namedParams[key];

      // Each named parameter gets its own positional index
      const paramIndex = paramValues.length + 1;
      paramValues.push(value);
      keyToIndexMap.set(key, paramIndex);

      // Replace all occurrences of this named parameter with its positional index
      const regex = new RegExp(`:${key}\\b`, 'g');
      convertedQuery = convertedQuery.replace(regex, `$${paramIndex}`);
    }

    return {query: convertedQuery, paramValues};
  }
}
