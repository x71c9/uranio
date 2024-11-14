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
    use_pool?: boolean;
};
export declare class MySQLClient {
    pool?: mysql.Pool;
    main_connection: mysql.Connection | undefined;
    protected uri: string;
    constructor(params: MySQLClientParams);
    exe(sql: string, values?: any): Promise<any[]>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    private _execute_from_pool_connection;
}
