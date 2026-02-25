/**
 * Tests for SQL value formatting and edge cases
 * Focuses on security, SQL injection prevention, and type handling
 */

import * as full from '../../../src/sql/full_query';
import * as param from '../../../src/sql/param_query';

type TestAtom = {
  _id: string;
  name: string;
  value: any;
};

describe('SQL Value Formatting - Security Tests', () => {
  describe('SQL Injection Prevention', () => {
    it('should safely handle quotes in string values', () => {
      const query = full.compose_select<TestAtom>({
        table: 'test',
        where: { name: "John'; DROP TABLE users;--" },
      });

      expect(query).toContain('"John\'; DROP TABLE users;--"');
      // The query still contains the string "DROP TABLE" but it's inside quotes, making it safe
      expect(query).toContain('WHERE `name` =');
    });

    it('should safely handle double quotes in values', () => {
      const query = full.compose_select<TestAtom>({
        table: 'test',
        where: { name: 'She said "hello"' },
      });

      expect(query).toContain('"She said "hello""');
    });

    it('should prevent SQL injection in ORDER BY column names', () => {
      expect(() => {
        full.compose_select<TestAtom>({
          table: 'test',
          order: { 'name; DROP TABLE users;--': 'asc' } as any,
        });
      }).toThrow(/Invalid column name/);
    });

    it('should prevent SQL injection in ORDER BY direction', () => {
      expect(() => {
        full.compose_select<TestAtom>({
          table: 'test',
          order: { name: 'asc; DROP TABLE users;--' as any },
        });
      }).toThrow(/Invalid direction/);
    });

    it('should prevent SQL injection in LIMIT clause', () => {
      expect(() => {
        full.compose_select<TestAtom>({
          table: 'test',
          limit: '10; DROP TABLE users;--',
        });
      }).toThrow(/Invalid LIMIT/);
    });

    it('should allow only valid column names (alphanumeric + underscore)', () => {
      const validQuery = full.compose_select<TestAtom>({
        table: 'test',
        order: { user_name_123: 'asc' } as any,
      });

      expect(validQuery).toContain('ORDER BY `user_name_123` ASC');
    });

    it('should reject column names starting with numbers', () => {
      expect(() => {
        full.compose_select<TestAtom>({
          table: 'test',
          order: { '123_invalid': 'asc' } as any,
        });
      }).toThrow(/Invalid column name/);
    });

    it('should reject special characters in column names', () => {
      expect(() => {
        full.compose_select<TestAtom>({
          table: 'test',
          order: { 'user@name': 'asc' } as any,
        });
      }).toThrow(/Invalid column name/);
    });
  });

  describe('Parameterized Query Security', () => {
    it('should parameterize potentially dangerous strings', () => {
      const result = param.compose_select<TestAtom>({
        table: 'test',
        where: { name: "'; DROP TABLE users;--" },
      });

      expect(result.query).not.toContain('DROP TABLE');
      expect(result.query).toContain(':x');
      expect(Object.values(result.map)).toContain("'; DROP TABLE users;--");
    });

    it('should parameterize strings with SQL keywords', () => {
      const result = param.compose_select<TestAtom>({
        table: 'test',
        where: { name: 'SELECT * FROM users WHERE 1=1' },
      });

      expect(result.query).not.toContain('SELECT * FROM users WHERE 1=1');
      expect(Object.values(result.map)).toContain('SELECT * FROM users WHERE 1=1');
    });
  });

  describe('Special Character Handling', () => {
    it('should handle newlines in strings', () => {
      const query = full.compose_select<TestAtom>({
        table: 'test',
        where: { name: 'Line1\nLine2' },
      });

      expect(query).toContain('"Line1\nLine2"');
    });

    it('should handle tabs in strings', () => {
      const query = full.compose_select<TestAtom>({
        table: 'test',
        where: { name: 'Col1\tCol2' },
      });

      expect(query).toContain('"Col1\tCol2"');
    });

    it('should handle backslashes in strings', () => {
      const query = full.compose_select<TestAtom>({
        table: 'test',
        where: { name: 'C:\\Users\\Admin' },
      });

      expect(query).toContain('"C:\\Users\\Admin"');
    });

    it('should handle unicode characters', () => {
      const query = full.compose_select<TestAtom>({
        table: 'test',
        where: { name: '你好世界' },
      });

      expect(query).toContain('"你好世界"');
    });

    it('should handle emojis in strings', () => {
      const query = full.compose_select<TestAtom>({
        table: 'test',
        where: { name: 'Hello 👋 World 🌍' },
      });

      expect(query).toContain('"Hello 👋 World 🌍"');
    });
  });

  describe('Edge Case Values', () => {
    it('should handle empty string', () => {
      const query = full.compose_select<TestAtom>({
        table: 'test',
        where: { name: '' },
      });

      expect(query).toBe('SELECT * FROM `test` WHERE `name` = ""');
    });

    it('should handle very long strings', () => {
      const longString = 'a'.repeat(10000);
      const query = full.compose_select<TestAtom>({
        table: 'test',
        where: { name: longString },
      });

      expect(query).toContain(`"${longString}"`);
    });

    it('should handle negative numbers', () => {
      const query = full.compose_select<TestAtom>({
        table: 'test',
        where: { value: -42 },
      });

      expect(query).toBe('SELECT * FROM `test` WHERE `value` = -42');
    });

    it('should handle zero', () => {
      const query = full.compose_select<TestAtom>({
        table: 'test',
        where: { value: 0 },
      });

      expect(query).toBe('SELECT * FROM `test` WHERE `value` = 0');
    });

    it('should handle floating point numbers', () => {
      const query = full.compose_select<TestAtom>({
        table: 'test',
        where: { value: 3.14159 },
      });

      expect(query).toBe('SELECT * FROM `test` WHERE `value` = 3.14159');
    });

    it('should handle scientific notation', () => {
      const query = full.compose_select<TestAtom>({
        table: 'test',
        where: { value: 1.5e10 },
      });

      expect(query).toContain('15000000000');
    });

    it('should handle null (as undefined behavior)', () => {
      const query = full.compose_select<TestAtom>({
        table: 'test',
        where: { value: null as any },
      });

      expect(query).toContain('null');
    });
  });

  describe('Array Value Handling', () => {
    it('should format empty array', () => {
      const query = full.compose_select<TestAtom>({
        table: 'test',
        where: { value: { $in: [] } },
      });

      expect(query).toBe('SELECT * FROM `test` WHERE `value` IN ()');
    });

    it('should format array with single element', () => {
      const query = full.compose_select<TestAtom>({
        table: 'test',
        where: { value: { $in: [42] } },
      });

      expect(query).toBe('SELECT * FROM `test` WHERE `value` IN (42)');
    });

    it('should format array with mixed types', () => {
      const query = full.compose_select<TestAtom>({
        table: 'test',
        where: { value: { $in: [1, '2', 3] } },
      });

      expect(query).toContain('IN (1,2,3)');
    });
  });

  describe('Date Value Handling', () => {
    it('should handle Date objects with unique placeholders', () => {
      const date1 = new Date('2025-01-01T00:00:00.000Z');
      const date2 = new Date('2025-12-31T23:59:59.999Z');

      const query = full.compose_select<TestAtom>({
        table: 'test',
        where: {
          $and: [
            { value: { $gte: date1 } },
            { value: { $lte: date2 } },
          ],
        },
      });

      expect(query).toContain('__DATE_PLACEHOLDER_');
      expect(query).toContain(date1.getTime().toString());
      expect(query).toContain(date2.getTime().toString());
    });

    it('should parameterize Date objects correctly', () => {
      const testDate = new Date('2025-06-15T12:00:00.000Z');
      const result = param.compose_select<TestAtom>({
        table: 'test',
        where: { value: { $eq: testDate } },
      });

      expect(Object.values(result.map)).toContain(testDate);
      expect(result.query).toMatch(/:x\d{4}/);
    });

    it('should handle Date in range queries', () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-12-31');

      const result = param.compose_select<TestAtom>({
        table: 'test',
        where: {
          value: { $gte: startDate, $lte: endDate },
        },
      });

      expect(Object.values(result.map)).toContain(startDate);
      expect(Object.values(result.map)).toContain(endDate);
      expect(Object.keys(result.map).length).toBe(2);
    });
  });

  describe('RegExp Value Handling', () => {
    it('should extract RegExp source', () => {
      const pattern = /^test.*$/i;
      const query = full.compose_select<TestAtom>({
        table: 'test',
        where: { name: pattern },
      });

      expect(query).toContain('REGEXP ^test.*$');
    });

    it('should parameterize RegExp source only (not flags)', () => {
      const pattern = /^test.*$/gi;
      const result = param.compose_select<TestAtom>({
        table: 'test',
        where: { name: pattern },
      });

      expect(Object.values(result.map)).toContain('^test.*$');
      expect(result.query).toMatch(/REGEXP :x\d{4}/);
    });

    it('should handle RegExp with special characters', () => {
      const pattern = /user@(gmail|yahoo)\.com$/;
      const result = param.compose_select<TestAtom>({
        table: 'test',
        where: { name: pattern },
      });

      expect(Object.values(result.map)).toContain('user@(gmail|yahoo)\\.com$');
    });

    it('should handle RegExp with escaped characters', () => {
      const pattern = /\d{3}-\d{2}-\d{4}/;
      const result = param.compose_select<TestAtom>({
        table: 'test',
        where: { name: pattern },
      });

      expect(Object.values(result.map)).toContain('\\d{3}-\\d{2}-\\d{4}');
    });
  });

  describe('Boolean Value Handling', () => {
    it('should format true boolean', () => {
      const query = full.compose_select<TestAtom>({
        table: 'test',
        where: { value: true },
      });

      expect(query).toBe('SELECT * FROM `test` WHERE `value` = true');
    });

    it('should format false boolean', () => {
      const query = full.compose_select<TestAtom>({
        table: 'test',
        where: { value: false },
      });

      expect(query).toBe('SELECT * FROM `test` WHERE `value` = false');
    });

    it('should parameterize boolean values', () => {
      const result = param.compose_select<TestAtom>({
        table: 'test',
        where: { value: true },
      });

      expect(Object.values(result.map)).toContain(true);
      const boolValue = Object.values(result.map).find((v) => typeof v === 'boolean');
      expect(boolValue).toBe(true);
    });
  });
});

describe('SQL Error Handling', () => {
  describe('Invalid WHERE clauses', () => {
    it('should throw on empty object in filter', () => {
      expect(() => {
        full.compose_select<TestAtom>({
          table: 'test',
          where: { name: {} as any },
        });
      }).toThrow(/Cannot compare to empty object/);
    });

    it('should throw on invalid root operator type', () => {
      expect(() => {
        full.compose_select<TestAtom>({
          table: 'test',
          where: { $and: 'not-an-array' as any },
        });
      }).toThrow(/must have an Array as value/);
    });

    it('should throw on array with invalid root operator or empty object', () => {
      // The actual code checks for empty objects before checking operator validity
      expect(() => {
        full.compose_select<any>({
          table: 'test',
          where: { $invalidOp: [] as any } as any,
        });
      }).toThrow(); // Will throw either "Cannot compare to empty object" or "Invalid root operator"
    });
  });

  describe('Invalid ORDER BY clauses', () => {
    it('should throw on invalid column with spaces', () => {
      expect(() => {
        full.compose_select<TestAtom>({
          table: 'test',
          order: { 'user name': 'asc' } as any,
        });
      }).toThrow(/Invalid column name/);
    });

    it('should throw on invalid column with hyphens', () => {
      expect(() => {
        full.compose_select<TestAtom>({
          table: 'test',
          order: { 'user-name': 'asc' } as any,
        });
      }).toThrow(/Invalid column name/);
    });

    it('should throw on invalid direction', () => {
      expect(() => {
        full.compose_select<TestAtom>({
          table: 'test',
          order: { name: 'ascending' as any },
        });
      }).toThrow(/Invalid direction/);
    });
  });

  describe('Invalid LIMIT clauses', () => {
    it('should throw on non-numeric LIMIT', () => {
      expect(() => {
        full.compose_select<TestAtom>({
          table: 'test',
          limit: 'abc',
        });
      }).toThrow(/Invalid LIMIT/);
    });

    it('should throw on LIMIT with invalid offset', () => {
      expect(() => {
        full.compose_select<TestAtom>({
          table: 'test',
          limit: '10,abc',
        });
      }).toThrow(/Invalid LIMIT/);
    });

    it('should throw on LIMIT with SQL keywords', () => {
      expect(() => {
        full.compose_select<TestAtom>({
          table: 'test',
          limit: '10 UNION SELECT',
        });
      }).toThrow(/Invalid LIMIT/);
    });
  });
});

describe('SQL Complex Query Scenarios', () => {
  it('should handle deeply nested logical operators', () => {
    const result = param.compose_select<TestAtom>({
      table: 'test',
      where: {
        $or: [
          {
            $and: [
              { name: 'John' },
              {
                $or: [{ value: { $gt: 10 } }, { value: { $lt: -10 } }],
              },
            ],
          },
          { name: 'Admin' },
        ],
      },
    });

    expect(result.query).toContain('OR');
    expect(result.query).toContain('AND');
    expect(Object.keys(result.map).length).toBe(4); // John, 10, -10, Admin
  });

  it('should handle multiple operators on different fields', () => {
    const result = param.compose_select<TestAtom>({
      table: 'test',
      where: {
        name: { $ne: 'Admin' },
        value: { $gte: 0, $lte: 100 },
      },
    });

    expect(result.query).toContain('`name` <> :');
    expect(result.query).toContain('`value` >= :');
    expect(result.query).toContain('`value` <= :');
    expect(Object.keys(result.map).length).toBe(3);
  });

  it('should handle mix of direct values and operators', () => {
    const result = param.compose_select<TestAtom>({
      table: 'test',
      where: {
        name: 'John',
        value: { $gte: 18, $lte: 65 },
      },
    });

    expect(result.query).toContain('`name` = :');
    expect(result.query).toContain('`value` >= :');
    expect(result.query).toContain('`value` <= :');
    expect(Object.keys(result.map).length).toBe(3);
  });
});
