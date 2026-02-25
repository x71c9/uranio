/**
 * Comprehensive tests for sql/full_query.ts
 * Tests SQL query generation without database connections
 */

import * as full from '../../../src/sql/full_query';

type TestAtom = {
  _id: string;
  name: string;
  age: number;
  email: string;
  active: boolean;
  createdAt: Date;
};

describe('SQL Full Query - compose_select', () => {
  describe('Basic SELECT queries', () => {
    it('should generate simple SELECT with all columns', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
      });
      expect(query).toBe('SELECT * FROM `users`');
    });

    it('should generate SELECT with specific columns', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        projection: ['name', 'email'],
      });
      expect(query).toBe('SELECT name, email FROM `users`');
    });

    it('should generate SELECT with simple WHERE clause', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: { name: 'John' },
      });
      expect(query).toBe('SELECT * FROM `users` WHERE `name` = "John"');
    });

    it('should generate SELECT with multiple WHERE conditions', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: { name: 'John', age: 30 },
      });
      expect(query).toBe('SELECT * FROM `users` WHERE `name` = "John" AND `age` = 30');
    });

    it('should generate SELECT with numeric WHERE clause', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: { age: 25 },
      });
      expect(query).toBe('SELECT * FROM `users` WHERE `age` = 25');
    });

    it('should generate SELECT with boolean WHERE clause', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: { active: true },
      });
      expect(query).toBe('SELECT * FROM `users` WHERE `active` = true');
    });
  });

  describe('WHERE clause with comparison operators', () => {
    it('should handle $eq operator', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: { age: { $eq: 30 } },
      });
      expect(query).toBe('SELECT * FROM `users` WHERE `age` = 30');
    });

    it('should handle $gt operator', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: { age: { $gt: 18 } },
      });
      expect(query).toBe('SELECT * FROM `users` WHERE `age` > 18');
    });

    it('should handle $gte operator', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: { age: { $gte: 21 } },
      });
      expect(query).toBe('SELECT * FROM `users` WHERE `age` >= 21');
    });

    it('should handle $lt operator', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: { age: { $lt: 65 } },
      });
      expect(query).toBe('SELECT * FROM `users` WHERE `age` < 65');
    });

    it('should handle $lte operator', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: { age: { $lte: 100 } },
      });
      expect(query).toBe('SELECT * FROM `users` WHERE `age` <= 100');
    });

    it('should handle $ne operator', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: { name: { $ne: 'Admin' } },
      });
      expect(query).toBe('SELECT * FROM `users` WHERE `name` <> "Admin"');
    });

    it('should handle multiple operators on same field', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: { age: { $gt: 18, $lt: 65 } },
      });
      expect(query).toBe('SELECT * FROM `users` WHERE `age` > 18 AND `age` < 65');
    });

    it('should handle range query with $gte and $lte', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: { age: { $gte: 25, $lte: 50 } },
      });
      expect(query).toBe('SELECT * FROM `users` WHERE `age` >= 25 AND `age` <= 50');
    });
  });

  describe('WHERE clause with $in and $nin operators', () => {
    it('should handle $in operator with array', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: { name: { $in: ['John', 'Jane', 'Bob'] } },
      });
      expect(query).toBe('SELECT * FROM `users` WHERE `name` IN (John,Jane,Bob)');
    });

    it('should handle $in operator with numeric array', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: { age: { $in: [25, 30, 35] } },
      });
      expect(query).toBe('SELECT * FROM `users` WHERE `age` IN (25,30,35)');
    });

    it('should handle $nin operator', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: { name: { $nin: ['Admin', 'Guest'] } },
      });
      expect(query).toBe('SELECT * FROM `users` WHERE `name` NOT IN (Admin,Guest)');
    });
  });

  describe('WHERE clause with $exists operator', () => {
    it('should handle $exists true', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: { email: { $exists: true } },
      });
      expect(query).toBe('SELECT * FROM `users` WHERE `email` IS NOT NULL');
    });

    it('should handle $exists false', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: { email: { $exists: false } },
      });
      expect(query).toBe('SELECT * FROM `users` WHERE `email` IS NULL');
    });
  });

  describe('WHERE clause with RegExp', () => {
    it('should handle RegExp pattern', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: { email: /.*@gmail\.com$/ },
      });
      expect(query).toBe('SELECT * FROM `users` WHERE `email` REGEXP .*@gmail\\.com$');
    });

    it('should handle multiple RegExp patterns', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: {
          email: /.*@gmail\.com$/,
          name: /^John.*/,
        },
      });
      expect(query).toBe(
        'SELECT * FROM `users` WHERE `email` REGEXP .*@gmail\\.com$ AND `name` REGEXP ^John.*'
      );
    });
  });

  describe('WHERE clause with logical operators', () => {
    it('should handle $and operator', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: {
          $and: [{ name: 'John' }, { age: 30 }],
        },
      });
      expect(query).toBe('SELECT * FROM `users` WHERE (`name` = "John" AND `age` = 30)');
    });

    it('should handle $or operator', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: {
          $or: [{ name: 'John' }, { name: 'Jane' }],
        },
      });
      expect(query).toBe('SELECT * FROM `users` WHERE (`name` = "John" OR `name` = "Jane")');
    });

    it('should handle $nor operator', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: {
          $nor: [{ name: 'Admin' }, { name: 'Guest' }],
        },
      });
      expect(query).toBe('SELECT * FROM `users` WHERE (`name` = "Admin" NOR `name` = "Guest")');
    });

    it('should handle nested $and and $or', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: {
          $or: [
            { name: 'John' },
            { $and: [{ age: { $gte: 25 } }, { age: { $lte: 35 } }] },
          ],
        },
      });
      expect(query).toBe(
        'SELECT * FROM `users` WHERE (`name` = "John" OR (`age` >= 25 AND `age` <= 35))'
      );
    });

    it('should handle complex nested logical operators', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: {
          $or: [
            { name: 'Admin' },
            { email: { $in: ['a@test.com', 'b@test.com'] } },
            { $and: [{ age: { $gt: 18 } }, { active: true }] },
          ],
        },
      });
      expect(query).toBe(
        'SELECT * FROM `users` WHERE (`name` = "Admin" OR `email` IN (a@test.com,b@test.com) OR (`age` > 18 AND `active` = true))'
      );
    });
  });

  describe('ORDER BY clause', () => {
    it('should handle single column ORDER BY ASC', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        order: { name: 'asc' },
      });
      expect(query).toBe('SELECT * FROM `users` ORDER BY `name` ASC');
    });

    it('should handle single column ORDER BY DESC', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        order: { age: 'desc' },
      });
      expect(query).toBe('SELECT * FROM `users` ORDER BY `age` DESC');
    });

    it('should handle multiple columns ORDER BY', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        order: { age: 'desc', name: 'asc' },
      });
      expect(query).toBe('SELECT * FROM `users` ORDER BY `age` DESC, `name` ASC');
    });

    it('should handle case-insensitive direction', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        order: { name: 'DESC' as 'desc' },
      });
      expect(query).toBe('SELECT * FROM `users` ORDER BY `name` DESC');
    });

    it('should reject invalid column name in ORDER BY', () => {
      expect(() => {
        full.compose_select<TestAtom>({
          table: 'users',
          order: { 'name; DROP TABLE users;--': 'asc' } as any,
        });
      }).toThrow(/Invalid column name/);
    });

    it('should reject invalid direction in ORDER BY', () => {
      expect(() => {
        full.compose_select<TestAtom>({
          table: 'users',
          order: { name: 'invalid' as any },
        });
      }).toThrow(/Invalid direction/);
    });
  });

  describe('LIMIT clause', () => {
    it('should handle simple LIMIT', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        limit: '10',
      });
      expect(query).toBe('SELECT * FROM `users` LIMIT 10');
    });

    it('should handle LIMIT with offset (MySQL style)', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        limit: '10,20',
      });
      expect(query).toBe('SELECT * FROM `users` LIMIT 10,20');
    });

    it('should handle LIMIT with OFFSET (PostgreSQL style)', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        limit: '10 OFFSET 20',
      });
      expect(query).toBe('SELECT * FROM `users` LIMIT 10 OFFSET 20');
    });

    it('should reject invalid LIMIT with SQL injection attempt', () => {
      expect(() => {
        full.compose_select<TestAtom>({
          table: 'users',
          limit: '10; DROP TABLE users;--',
        });
      }).toThrow(/Invalid LIMIT/);
    });

    it('should reject negative LIMIT', () => {
      expect(() => {
        full.compose_select<TestAtom>({
          table: 'users',
          limit: '-10',
        });
      }).toThrow(/Invalid LIMIT/);
    });
  });

  describe('Complete SELECT queries', () => {
    it('should generate complete query with all clauses', () => {
      const query = full.compose_select<TestAtom>({
        projection: ['name', 'age', 'email'],
        table: 'users',
        where: { age: { $gte: 18, $lte: 65 }, active: true },
        order: { age: 'desc', name: 'asc' },
        limit: '10',
      });
      expect(query).toBe(
        'SELECT name, age, email FROM `users` WHERE `age` >= 18 AND `age` <= 65 AND `active` = true ORDER BY `age` DESC, `name` ASC LIMIT 10'
      );
    });

    it('should handle empty WHERE clause', () => {
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: {},
      });
      expect(query).toBe('SELECT * FROM `users`');
    });
  });

  describe('Date handling', () => {
    it('should format Date objects with placeholder', () => {
      const testDate = new Date('2025-01-01T00:00:00.000Z');
      const query = full.compose_select<TestAtom>({
        table: 'users',
        where: { createdAt: { $eq: testDate } },
      });
      expect(query).toContain('__DATE_PLACEHOLDER_');
      expect(query).toContain(testDate.getTime().toString());
    });
  });
});

describe('SQL Full Query - compose_update', () => {
  it('should generate simple UPDATE query', () => {
    const query = full.compose_update<TestAtom>({
      table: 'users',
      update: { name: 'John Updated' },
      where: { _id: '123' },
    });
    expect(query).toBe('UPDATE `users` SET name = "John Updated" WHERE `_id` = "123"');
  });

  it('should generate UPDATE with multiple fields', () => {
    const query = full.compose_update<TestAtom>({
      table: 'users',
      update: { name: 'John', age: 31, active: false },
      where: { _id: '123' },
    });
    expect(query).toBe(
      'UPDATE `users` SET name = "John", age = 31, active = false WHERE `_id` = "123"'
    );
  });

  it('should generate UPDATE with complex WHERE', () => {
    const query = full.compose_update<TestAtom>({
      table: 'users',
      update: { active: false },
      where: { age: { $lt: 18 } },
    });
    expect(query).toBe('UPDATE `users` SET active = false WHERE `age` < 18');
  });

  it('should generate UPDATE with logical operators in WHERE', () => {
    const query = full.compose_update<TestAtom>({
      table: 'users',
      update: { active: true },
      where: {
        $or: [{ age: { $gte: 18 } }, { name: 'Admin' }],
      },
    });
    expect(query).toBe(
      'UPDATE `users` SET active = true WHERE (`age` >= 18 OR `name` = "Admin")'
    );
  });
});

describe('SQL Full Query - compose_delete', () => {
  it('should generate simple DELETE query', () => {
    const query = full.compose_delete<TestAtom>({
      table: 'users',
      where: { _id: '123' },
    });
    expect(query).toBe('DELETE FROM `users` WHERE `_id` = "123"');
  });

  it('should generate DELETE with complex WHERE', () => {
    const query = full.compose_delete<TestAtom>({
      table: 'users',
      where: { active: false, age: { $lt: 18 } },
    });
    expect(query).toBe('DELETE FROM `users` WHERE `active` = false AND `age` < 18');
  });

  it('should generate DELETE with logical operators', () => {
    const query = full.compose_delete<TestAtom>({
      table: 'users',
      where: {
        $or: [{ name: 'Guest' }, { email: { $exists: false } }],
      },
    });
    expect(query).toBe('DELETE FROM `users` WHERE (`name` = "Guest" OR `email` IS NULL)');
  });
});

describe('SQL Full Query - compose_insert', () => {
  it('should generate simple INSERT query', () => {
    const query = full.compose_insert<TestAtom>({
      table: 'users',
      columns: ['name', 'age'],
      records: [{ name: 'John', age: 30 }],
    });
    expect(query).toBe('INSERT INTO `users` (`name`, `age`) VALUES ("John", 30)');
  });

  it('should generate INSERT with multiple records', () => {
    const query = full.compose_insert<TestAtom>({
      table: 'users',
      columns: ['name', 'age', 'email'],
      records: [
        { name: 'John', age: 30, email: 'john@test.com' },
        { name: 'Jane', age: 25, email: 'jane@test.com' },
        { name: 'Bob', age: 35, email: 'bob@test.com' },
      ],
    });
    expect(query).toBe(
      'INSERT INTO `users` (`name`, `age`, `email`) VALUES ("John", 30, "john@test.com"), ("Jane", 25, "jane@test.com"), ("Bob", 35, "bob@test.com")'
    );
  });

  it('should handle boolean values in INSERT', () => {
    const query = full.compose_insert<TestAtom>({
      table: 'users',
      columns: ['name', 'active'],
      records: [{ name: 'John', active: true }],
    });
    expect(query).toBe('INSERT INTO `users` (`name`, `active`) VALUES ("John", true)');
  });

  it('should handle numeric values in INSERT', () => {
    const query = full.compose_insert<TestAtom>({
      table: 'users',
      columns: ['age'],
      records: [{ age: 0 }, { age: 100 }, { age: -5 }],
    });
    expect(query).toBe('INSERT INTO `users` (`age`) VALUES (0), (100), (-5)');
  });
});

describe('SQL Full Query - Edge Cases and Security', () => {
  it('should handle string with quotes', () => {
    const query = full.compose_select<TestAtom>({
      table: 'users',
      where: { name: 'John "The Boss" Doe' },
    });
    expect(query).toBe('SELECT * FROM `users` WHERE `name` = "John "The Boss" Doe"');
  });

  it('should handle empty object WHERE clause', () => {
    expect(() => {
      full.compose_select<TestAtom>({
        table: 'users',
        where: { name: {} as any },
      });
    }).toThrow(/Cannot compare to empty object/);
  });

  it('should handle undefined WHERE clause', () => {
    const query = full.compose_select<TestAtom>({
      table: 'users',
      where: undefined,
    });
    expect(query).toBe('SELECT * FROM `users`');
  });

  it('should reject invalid root operator value', () => {
    expect(() => {
      full.compose_select<TestAtom>({
        table: 'users',
        where: { $and: 'invalid' as any },
      });
    }).toThrow(/must have an Array as value/);
  });
});
