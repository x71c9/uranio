/**
 * Unit tests for pool connection handling of the SQL clients.
 * A connection taken from the pool must be released whether its query
 * succeeds or throws: a leak per failed query drains the pool, after which
 * every later query waits forever for a free connection.
 */

import {PostgreSQLClient} from '../../../src/client/postgresql';
import {MySQLClient} from '../../../src/client/mysql';

function fakePool(run: () => Promise<any>) {
  const connection = {
    threadId: 1,
    release: jest.fn(),
    query: jest.fn(run),
    execute: jest.fn(run),
  };
  const pool = {
    connect: jest.fn(async () => connection),
    getConnection: jest.fn(async () => connection),
  };
  return {pool, connection};
}

describe('Pool connection release', () => {
  describe('PostgreSQLClient', () => {
    function clientWith(pool: any) {
      const client = new PostgreSQLClient({uri: 'postgresql://test:test@localhost:5432/test'});
      client.pool = pool;
      return client;
    }

    it('releases the connection after a successful query', async () => {
      const {pool, connection} = fakePool(async () => ({rows: [{a: 1}], fields: []}));
      const [rows] = await clientWith(pool).exe('SELECT 1', []);
      expect(rows).toEqual([{a: 1}]);
      expect(connection.release).toHaveBeenCalledTimes(1);
    });

    it('releases the connection when the query throws, and rethrows', async () => {
      const {pool, connection} = fakePool(async () => {
        throw new Error('relation "missing" does not exist');
      });
      await expect(clientWith(pool).exe('INSERT INTO missing VALUES ($1)', [1])).rejects.toThrow(
        'relation "missing" does not exist',
      );
      expect(connection.release).toHaveBeenCalledTimes(1);
    });

    it('releases one connection per failed query', async () => {
      const {pool, connection} = fakePool(async () => {
        throw new Error('boom');
      });
      const client = clientWith(pool);
      for (let i = 0; i < 12; i++) {
        await expect(client.exe('SELECT 1', [])).rejects.toThrow('boom');
      }
      expect(connection.release).toHaveBeenCalledTimes(12);
    });
  });

  describe('MySQLClient', () => {
    function clientWith(pool: any) {
      const client = new MySQLClient({uri: 'mysql://test:test@localhost:3306/test'});
      client.pool = pool;
      return client;
    }

    it('releases the connection after a successful query', async () => {
      const {pool, connection} = fakePool(async () => [[{a: 1}], []]);
      const [rows] = await clientWith(pool).exe('SELECT 1');
      expect(rows).toEqual([{a: 1}]);
      expect(connection.release).toHaveBeenCalledTimes(1);
    });

    it('releases the connection when the query throws, and rethrows', async () => {
      const {pool, connection} = fakePool(async () => {
        throw new Error("Table 'test.missing' doesn't exist");
      });
      await expect(clientWith(pool).exe('INSERT INTO missing VALUES (1)')).rejects.toThrow(
        "Table 'test.missing' doesn't exist",
      );
      expect(connection.release).toHaveBeenCalledTimes(1);
    });
  });
});
