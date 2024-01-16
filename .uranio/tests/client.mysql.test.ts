import {describe, it, before} from 'node:test';
import assert from 'node:assert';

import mysql from 'mysql2/promise';

import {UranioMySQLClient as MySQLClient} from '../src/client';

import * as sql from '../src/sql/index';

const mysql_uri = process.env.MYSQL_URI || '';

type Pippo = {
  _id: string
}

describe('MySQL Client', () => {

  before(() => {});

  it('should return the mocked rows MYSQL POOL', async () => {
    const mysql_urn = new MySQLClient({
      uri: mysql_uri,
      use_pool: true
    });
    const mock_rows = [{ id: 1, name: 'John' }, {id: 2, name: 'Franco'}];
    const mock_pool = {
      getConnection: async () => {
        return {
          execute: async () => {
            const fields = {};
            return [mock_rows, fields];
          },
          threadId: 0,
          release: () => {}
        }
      },
    };
    mysql_urn.pool = mock_pool as any;
    const query = sql.full.compose_select<Pippo>({table: 'pippo'});
    try{
      const [rows_00] = await mysql_urn.exe(query);
      assert.strictEqual(rows_00, mock_rows);
    }catch(e){
      const err = e as Error;
     assert.fail(`Unexpected error: ${err.message}`); 
    }finally{
    }
  });

  it('should return the mocked rows MYSQL MAIN', async () => {
    const mysql_urn = new MySQLClient({
      uri: mysql_uri
    });
    const mock_rows = [{ id: 1, name: 'John' }, {id: 2, name: 'Franco'}];
    const mock_create_connection = async () => {
      return {
        execute: async () => {
          const fields = {};
          return [mock_rows, fields];
        },
        end: () => {}
      }
    };
    const original_create_connection = mysql.createConnection;
    mysql.createConnection = mock_create_connection as any;
    
    const query = sql.full.compose_select<Pippo>({table: 'pippo'});
    
    try{
      const [rows_00] = await mysql_urn.exe(query);
      assert.strictEqual(rows_00, mock_rows);
    }catch(e){
      const err = e as Error;
     assert.fail(`Unexpected error: ${err.message}`); 
    }finally{
      mysql.createConnection = original_create_connection;
    }
  });

});
