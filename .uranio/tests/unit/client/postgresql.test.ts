/**
 * Unit tests for PostgreSQL client
 * Tests parameter conversion and query building
 */

import {PostgreSQLClient} from '../../../src/client/postgresql';

describe('PostgreSQL Client', () => {
  describe('_convert_named_to_positional', () => {
    let client: PostgreSQLClient;

    beforeEach(() => {
      client = new PostgreSQLClient({
        uri: 'postgresql://test:test@localhost:5432/test',
        usePool: false,
      });
    });

    afterEach(async () => {
      if (client) {
        await client.disconnect();
      }
    });

    it('should convert named parameters to positional parameters', () => {
      const sql = 'SELECT * FROM "users" WHERE "name" = :x0000 AND "age" = :x0001';
      const namedParams = {
        x0000: 'John',
        x0001: 30,
      };

      const result = (client as any)._convert_named_to_positional(sql, namedParams);

      expect(result.query).toBe('SELECT * FROM "users" WHERE "name" = $1 AND "age" = $2');
      expect(result.paramValues).toEqual(['John', 30]);
    });

    it('should handle INSERT with duplicate Date values', () => {
      const now = new Date('2026-02-28T15:54:31.000Z');
      const sql = 'INSERT INTO "bit" ("id", "created_at", "updated_at") VALUES (:x0000, :x0001, :x0002)';
      const namedParams = {
        x0000: '6e358feb-de2b-46b5-9046-29662d00e58a',
        x0001: now,
        x0002: now, // Same Date value as x0001
      };

      const result = (client as any)._convert_named_to_positional(sql, namedParams);

      // Each parameter should have its own index, even if values are the same
      expect(result.query).toBe(
        'INSERT INTO "bit" ("id", "created_at", "updated_at") VALUES ($1, $2, $3)'
      );
      expect(result.paramValues).toEqual([
        '6e358feb-de2b-46b5-9046-29662d00e58a',
        now,
        now,
      ]);
      expect(result.paramValues.length).toBe(3);
    });

    it('should handle INSERT with all columns having duplicate Date values', () => {
      const now = new Date('2026-02-28T15:54:31.000Z');
      const sql =
        'INSERT INTO "bit" ("id", "modulo", "created_at", "updated_at", "content", "frequency", "timezone", "active", "owner") VALUES (:x0000, :x0001, :x0002, :x0003, :x0004, :x0005, :x0006, :x0007, :x0008)';
      const namedParams = {
        x0000: '6e358feb-de2b-46b5-9046-29662d00e58a',
        x0001: 0,
        x0002: now,
        x0003: now, // Same as x0002
        x0004: 'Bit numero 1',
        x0005: 2,
        x0006: 'UTC',
        x0007: true,
        x0008: 'fe54aaa4-830b-44c9-85a3-e54343feaf08',
      };

      const result = (client as any)._convert_named_to_positional(sql, namedParams);

      // Should create parameters $1 through $9 without skipping any
      expect(result.query).toBe(
        'INSERT INTO "bit" ("id", "modulo", "created_at", "updated_at", "content", "frequency", "timezone", "active", "owner") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)'
      );
      expect(result.paramValues.length).toBe(9);
      expect(result.paramValues[0]).toBe('6e358feb-de2b-46b5-9046-29662d00e58a');
      expect(result.paramValues[1]).toBe(0);
      expect(result.paramValues[2]).toBe(now);
      expect(result.paramValues[3]).toBe(now);
      expect(result.paramValues[4]).toBe('Bit numero 1');
      expect(result.paramValues[5]).toBe(2);
      expect(result.paramValues[6]).toBe('UTC');
      expect(result.paramValues[7]).toBe(true);
      expect(result.paramValues[8]).toBe('fe54aaa4-830b-44c9-85a3-e54343feaf08');

      // Verify no $10 or higher parameter numbers are created
      expect(result.query).not.toContain('$10');
      // Verify all parameters $1-$9 are present
      for (let i = 1; i <= 9; i++) {
        expect(result.query).toContain(`$${i}`);
      }
    });

    it('should handle duplicate string values', () => {
      const sql = 'INSERT INTO "users" ("name", "email") VALUES (:x0000, :x0001)';
      const namedParams = {
        x0000: 'test@example.com',
        x0001: 'test@example.com', // Same value
      };

      const result = (client as any)._convert_named_to_positional(sql, namedParams);

      expect(result.query).toBe('INSERT INTO "users" ("name", "email") VALUES ($1, $2)');
      expect(result.paramValues).toEqual(['test@example.com', 'test@example.com']);
      expect(result.paramValues.length).toBe(2);
    });

    it('should handle duplicate number values', () => {
      const sql = 'INSERT INTO "config" ("min", "max") VALUES (:x0000, :x0001)';
      const namedParams = {
        x0000: 100,
        x0001: 100, // Same value
      };

      const result = (client as any)._convert_named_to_positional(sql, namedParams);

      expect(result.query).toBe('INSERT INTO "config" ("min", "max") VALUES ($1, $2)');
      expect(result.paramValues).toEqual([100, 100]);
      expect(result.paramValues.length).toBe(2);
    });

    it('should convert MySQL backticks to PostgreSQL double quotes', () => {
      const sql = 'SELECT * FROM `users` WHERE `name` = :x0000';
      const namedParams = {
        x0000: 'John',
      };

      const result = (client as any)._convert_named_to_positional(sql, namedParams);

      expect(result.query).toBe('SELECT * FROM "users" WHERE "name" = $1');
      expect(result.paramValues).toEqual(['John']);
    });

    it('should handle empty parameters', () => {
      const sql = 'SELECT * FROM "users"';

      const result = (client as any)._convert_named_to_positional(sql, {});

      expect(result.query).toBe('SELECT * FROM "users"');
      expect(result.paramValues).toEqual([]);
    });

    it('should handle undefined parameters', () => {
      const sql = 'SELECT * FROM "users"';

      const result = (client as any)._convert_named_to_positional(sql);

      expect(result.query).toBe('SELECT * FROM "users"');
      expect(result.paramValues).toEqual([]);
    });

    it('should maintain parameter order based on sorted keys', () => {
      const sql =
        'INSERT INTO "users" ("id", "name", "age") VALUES (:x0002, :x0000, :x0001)';
      const namedParams = {
        x0002: '123',
        x0000: 'John',
        x0001: 30,
      };

      const result = (client as any)._convert_named_to_positional(sql, namedParams);

      // Keys are sorted, so x0000, x0001, x0002
      expect(result.query).toBe(
        'INSERT INTO "users" ("id", "name", "age") VALUES ($3, $1, $2)'
      );
      expect(result.paramValues).toEqual(['John', 30, '123']);
    });
  });
});
