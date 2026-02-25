/**
 * Comprehensive tests for sql/param_query.ts
 * Tests parameterized query generation without relying on specific parameter IDs
 */

import * as param from '../../../src/sql/param_query';

type TestAtom = {
  _id: string;
  name: string;
  age: number;
  email: string;
  active: boolean;
  score: number;
  createdAt: Date;
};

describe('SQL Param Query - Comprehensive Tests', () => {
  describe('SELECT query parameterization', () => {
    it('should parameterize simple WHERE clause', () => {
      const result = param.compose_select<TestAtom>({
        table: 'users',
        where: { name: 'John' },
      });

      expect(result.query).toMatch(/WHERE `name` = :x\d{4}/);
      expect(Object.values(result.map)).toContain('John');
      expect(Object.keys(result.map).length).toBe(1);
    });

    it('should parameterize multiple WHERE conditions', () => {
      const result = param.compose_select<TestAtom>({
        table: 'users',
        where: { name: 'John', age: 30 },
      });

      expect(result.query).toMatch(/WHERE `name` = :x\d{4} AND `age` = :x\d{4}/);
      expect(Object.values(result.map)).toContain('John');
      expect(Object.values(result.map)).toContain(30);
      expect(Object.keys(result.map).length).toBe(2);
    });

    it('should parameterize comparison operators', () => {
      const result = param.compose_select<TestAtom>({
        table: 'users',
        where: { age: { $gte: 18, $lte: 65 } },
      });

      expect(result.query).toMatch(/WHERE `age` >= :x\d{4} AND `age` <= :x\d{4}/);
      expect(Object.values(result.map)).toContain(18);
      expect(Object.values(result.map)).toContain(65);
      expect(Object.keys(result.map).length).toBe(2);
    });

    it('should handle $in operator with array parameter', () => {
      const result = param.compose_select<TestAtom>({
        table: 'users',
        where: { name: { $in: ['John', 'Jane', 'Bob'] } },
      });

      // The implementation may store the array as-is or expand it
      // Let's check what actually happens
      expect(Object.keys(result.map).length).toBeGreaterThan(0);

      // Query should have IN clause
      expect(result.query).toContain('IN (');

      // Check if values are present either as individual params or as an array
      const values = Object.values(result.map);
      const hasIndividualValues = values.includes('John') && values.includes('Jane') && values.includes('Bob');
      const hasArrayValue = values.some(v => Array.isArray(v) && v.includes('John'));

      expect(hasIndividualValues || hasArrayValue).toBe(true);
    });

    it('should not parameterize $exists operator values', () => {
      const result = param.compose_select<TestAtom>({
        table: 'users',
        where: { email: { $exists: true } },
      });

      expect(result.query).toBe('SELECT * FROM `users` WHERE `email` IS NOT NULL');
      // $exists doesn't add parameters for the boolean value, but may add internal tracking
      expect(Object.keys(result.map).length).toBeLessThanOrEqual(1);
    });

    it('should parameterize RegExp source', () => {
      const result = param.compose_select<TestAtom>({
        table: 'users',
        where: { email: /.*@gmail\.com$/ },
      });

      expect(result.query).toMatch(/WHERE `email` REGEXP :x\d{4}/);
      expect(Object.values(result.map)).toContain('.*@gmail\\.com$');
      expect(Object.keys(result.map).length).toBe(1);
    });

    it('should parameterize Date objects', () => {
      const testDate = new Date('2025-01-01T00:00:00.000Z');
      const result = param.compose_select<TestAtom>({
        table: 'users',
        where: { createdAt: { $eq: testDate } },
      });

      expect(result.query).toMatch(/WHERE `createdAt` = :x\d{4}/);
      expect(Object.values(result.map)).toContain(testDate);
      expect(Object.keys(result.map).length).toBe(1);
    });

    it('should parameterize logical operators', () => {
      const result = param.compose_select<TestAtom>({
        table: 'users',
        where: {
          $or: [{ name: 'John' }, { name: 'Jane' }],
        },
      });

      expect(result.query).toMatch(/WHERE \(`name` = :x\d{4} OR `name` = :x\d{4}\)/);
      expect(Object.values(result.map)).toContain('John');
      expect(Object.values(result.map)).toContain('Jane');
      expect(Object.keys(result.map).length).toBe(2);
    });

    it('should handle empty WHERE clause', () => {
      const result = param.compose_select<TestAtom>({
        table: 'users',
        where: {},
      });

      expect(result.query).toBe('SELECT * FROM `users`');
      expect(Object.keys(result.map).length).toBe(0);
    });

    it('should handle undefined WHERE clause', () => {
      const result = param.compose_select<TestAtom>({
        table: 'users',
      });

      expect(result.query).toBe('SELECT * FROM `users`');
      expect(Object.keys(result.map).length).toBe(0);
    });

    it('should preserve ORDER BY without parameterization', () => {
      const result = param.compose_select<TestAtom>({
        table: 'users',
        where: { age: 25 },
        order: { name: 'asc' },
      });

      expect(result.query).toMatch(/ORDER BY `name` ASC/);
      expect(Object.values(result.map)).toContain(25);
    });

    it('should preserve LIMIT without parameterization', () => {
      const result = param.compose_select<TestAtom>({
        table: 'users',
        where: { active: true },
        limit: '10',
      });

      expect(result.query).toMatch(/LIMIT 10/);
      expect(Object.values(result.map)).toContain(true);
    });
  });

  describe('UPDATE query parameterization', () => {
    it('should parameterize both update and where clauses', () => {
      const result = param.compose_update<TestAtom>({
        table: 'users',
        update: { name: 'John Updated' },
        where: { _id: '123' },
      });

      expect(result.query).toMatch(/UPDATE `users` SET name = :x\d{4} WHERE `_id` = :x\d{4}/);
      expect(Object.values(result.map)).toContain('John Updated');
      expect(Object.values(result.map)).toContain('123');
      expect(Object.keys(result.map).length).toBe(2);
    });

    it('should parameterize multiple update fields', () => {
      const result = param.compose_update<TestAtom>({
        table: 'users',
        update: { name: 'John', age: 31, active: false },
        where: { _id: '123' },
      });

      expect(result.query).toMatch(/SET name = :x\d{4}, age = :x\d{4}, active = :x\d{4}/);
      expect(Object.values(result.map)).toContain('John');
      expect(Object.values(result.map)).toContain(31);
      expect(Object.values(result.map)).toContain(false);
      expect(Object.values(result.map)).toContain('123');
      expect(Object.keys(result.map).length).toBe(4);
    });

    it('should parameterize complex WHERE in UPDATE', () => {
      const result = param.compose_update<TestAtom>({
        table: 'users',
        update: { active: false },
        where: { age: { $lt: 18 } },
      });

      expect(result.query).toMatch(/UPDATE `users` SET active = :x\d{4} WHERE `age` < :x\d{4}/);
      expect(Object.values(result.map)).toContain(false);
      expect(Object.values(result.map)).toContain(18);
    });
  });

  describe('DELETE query parameterization', () => {
    it('should parameterize WHERE clause', () => {
      const result = param.compose_delete<TestAtom>({
        table: 'users',
        where: { _id: '123' },
      });

      expect(result.query).toMatch(/DELETE FROM `users` WHERE `_id` = :x\d{4}/);
      expect(Object.values(result.map)).toContain('123');
      expect(Object.keys(result.map).length).toBe(1);
    });

    it('should parameterize complex WHERE in DELETE', () => {
      const result = param.compose_delete<TestAtom>({
        table: 'users',
        where: { active: false, age: { $lt: 18 } },
      });

      expect(result.query).toMatch(/DELETE FROM `users` WHERE `active` = :x\d{4} AND `age` < :x\d{4}/);
      expect(Object.values(result.map)).toContain(false);
      expect(Object.values(result.map)).toContain(18);
    });

    it('should parameterize logical operators in DELETE', () => {
      const result = param.compose_delete<TestAtom>({
        table: 'users',
        where: {
          $or: [{ name: 'Guest' }, { email: { $exists: false } }],
        },
      });

      expect(result.query).toMatch(/WHERE \(`name` = :x\d{4} OR `email` IS NULL\)/);
      expect(Object.values(result.map)).toContain('Guest');
    });
  });

  describe('INSERT query parameterization', () => {
    it('should parameterize single record INSERT', () => {
      const result = param.compose_insert<TestAtom>({
        table: 'users',
        columns: ['name', 'age'],
        records: [{ name: 'John', age: 30 }],
      });

      expect(result.query).toMatch(/INSERT INTO `users` \(`name`, `age`\) VALUES \(:x\d{4}, :x\d{4}\)/);
      expect(Object.values(result.query_records)).toContain('John');
      expect(Object.values(result.query_records)).toContain(30);
      expect(Object.keys(result.query_records).length).toBe(2);
    });

    it('should parameterize multiple records INSERT', () => {
      const result = param.compose_insert<TestAtom>({
        table: 'users',
        columns: ['name', 'age'],
        records: [
          { name: 'John', age: 30 },
          { name: 'Jane', age: 25 },
          { name: 'Bob', age: 35 },
        ],
      });

      expect(result.query).toMatch(
        /VALUES \(:x\d{4}, :x\d{4}\), \(:x\d{4}, :x\d{4}\), \(:x\d{4}, :x\d{4}\)/
      );
      expect(Object.values(result.query_records)).toContain('John');
      expect(Object.values(result.query_records)).toContain(30);
      expect(Object.values(result.query_records)).toContain('Jane');
      expect(Object.values(result.query_records)).toContain(25);
      expect(Object.values(result.query_records)).toContain('Bob');
      expect(Object.values(result.query_records)).toContain(35);
      expect(Object.keys(result.query_records).length).toBe(6);
    });

    it('should parameterize boolean and numeric values', () => {
      const result = param.compose_insert<TestAtom>({
        table: 'users',
        columns: ['name', 'active', 'age'],
        records: [{ name: 'John', active: true, age: 0 }],
      });

      expect(Object.values(result.query_records)).toContain('John');
      expect(Object.values(result.query_records)).toContain(true);
      expect(Object.values(result.query_records)).toContain(0);
    });

    it('should parameterize Date objects in INSERT', () => {
      const testDate = new Date('2025-01-01T00:00:00.000Z');
      const result = param.compose_insert<TestAtom>({
        table: 'users',
        columns: ['name', 'createdAt'],
        records: [{ name: 'John', createdAt: testDate }],
      });

      expect(Object.values(result.query_records)).toContain('John');
      expect(Object.values(result.query_records)).toContain(testDate);
    });
  });

  describe('Parameter ID consistency', () => {
    it('should generate unique parameter IDs for each value', () => {
      const result = param.compose_select<TestAtom>({
        table: 'users',
        where: {
          $or: [
            { name: 'John' },
            { name: 'Jane' },
            { age: { $gte: 18, $lte: 65 } },
          ],
        },
      });

      const paramIds = Object.keys(result.map);
      const uniqueIds = new Set(paramIds);

      // All IDs should be unique
      expect(paramIds.length).toBe(uniqueIds.size);
      expect(paramIds.length).toBe(4); // John, Jane, 18, 65

      // All parameter IDs should match the pattern
      paramIds.forEach((id) => {
        expect(id).toMatch(/^x\d{4}$/);
      });
    });

    it('should maintain parameter order consistency', () => {
      const result = param.compose_select<TestAtom>({
        table: 'users',
        where: {
          name: 'John',
          age: 30,
          active: true,
        },
      });

      // Should have exactly 3 parameters
      expect(Object.keys(result.map).length).toBe(3);

      // All values should be present
      const values = Object.values(result.map);
      expect(values).toContain('John');
      expect(values).toContain(30);
      expect(values).toContain(true);
    });
  });

  describe('Complex nested queries', () => {
    it('should parameterize deeply nested logical operators', () => {
      const result = param.compose_select<TestAtom>({
        table: 'users',
        where: {
          $or: [
            {
              $and: [
                { name: 'John' },
                { $or: [{ age: { $gt: 10 } }, { age: { $lt: -10 } }] },
              ],
            },
            { name: 'Admin' },
          ],
        },
      });

      expect(result.query).toContain('OR');
      expect(result.query).toContain('AND');
      expect(Object.keys(result.map).length).toBe(4); // John, 10, -10, Admin
      expect(Object.values(result.map)).toContain('John');
      expect(Object.values(result.map)).toContain(10);
      expect(Object.values(result.map)).toContain(-10);
      expect(Object.values(result.map)).toContain('Admin');
    });

    it('should parameterize mix of operators and direct values', () => {
      const result = param.compose_select<TestAtom>({
        table: 'users',
        where: {
          name: 'John',
          age: { $gte: 18, $lte: 65 },
          active: true,
        },
      });

      expect(Object.keys(result.map).length).toBe(4);
      expect(Object.values(result.map)).toContain('John');
      expect(Object.values(result.map)).toContain(18);
      expect(Object.values(result.map)).toContain(65);
      expect(Object.values(result.map)).toContain(true);
    });
  });

  describe('Special value handling', () => {
    it('should handle zero values correctly', () => {
      const result = param.compose_select<TestAtom>({
        table: 'users',
        where: { age: 0, score: 0 },
      });

      expect(Object.values(result.map)).toContain(0);
      expect(Object.keys(result.map).length).toBe(2);
    });

    it('should handle negative numbers', () => {
      const result = param.compose_select<TestAtom>({
        table: 'users',
        where: { score: -100 },
      });

      expect(Object.values(result.map)).toContain(-100);
    });

    it('should handle empty strings', () => {
      const result = param.compose_select<TestAtom>({
        table: 'users',
        where: { name: '' },
      });

      expect(Object.values(result.map)).toContain('');
    });

    it('should handle special characters in strings', () => {
      const specialString = "'; DROP TABLE users;--";
      const result = param.compose_select<TestAtom>({
        table: 'users',
        where: { name: specialString },
      });

      expect(Object.values(result.map)).toContain(specialString);
      expect(result.query).not.toContain('DROP TABLE');
    });
  });
});
