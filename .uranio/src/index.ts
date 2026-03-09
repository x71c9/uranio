/**
 *
 * Index module
 *
 * @packageDocumentation
 *
 */

export * from './types/index';

import {set} from './config/index';
export const config = {set};

import {UranioMongoDBClient as MongoDBClient} from './client';
export {MongoDBClient};

import {UranioMySQLClient as MySQLClient} from './client';
export {MySQLClient};

import {UranioPostgreSQLClient as PostgreSQLClient} from './client';
export {PostgreSQLClient};
