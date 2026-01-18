/**
 *
 * MySQL Client module
 *
 * @packageDocumentation
 *
 */
import mysql from 'mysql2/promise';
export type MySQLClientParams = {
    uri: string;
    usePool?: boolean;
    timezone?: string;
};
export declare class MySQLClient {
    pool?: mysql.Pool;
    mainConnection: mysql.Connection | undefined;
    protected uri: string;
    protected timezone: string;
    constructor(params: MySQLClientParams);
    exe(sql: string, values?: any): Promise<any[]>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    private _execute_from_pool_connection;
}
