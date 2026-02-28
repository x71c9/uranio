/**
 * SQL template string builder
 * Simplified implementation inspired by sql-template-strings
 *
 * This provides a secure way to build SQL queries using template literals.
 * Values are never embedded into SQL strings, preventing SQL injection.
 *
 * Usage:
 *   const name = 'John';
 *   const query = SQL`SELECT * FROM users WHERE name = ${name}`;
 *
 *   // For MySQL:
 *   query.mysql()  // { sql: "SELECT * FROM users WHERE name = ?", values: ['John'] }
 *
 *   // For PostgreSQL:
 *   query.postgres()  // { sql: "SELECT * FROM users WHERE name = $1", values: ['John'] }
 *
 * @packageDocumentation
 */

export class SQLStatement {
  private strings: string[];
  private values: any[];

  constructor(strings: string[], values: any[]) {
    this.strings = strings;
    this.values = values;
  }

  /**
   * Returns MySQL/MariaDB-compatible query with ? placeholders
   */
  mysql(): { sql: string; values: any[] } {
    return {
      sql: this.strings.join('?'),
      values: this.values,
    };
  }

  /**
   * Returns PostgreSQL-compatible query with $1, $2, ... placeholders
   */
  postgres(): { sql: string; values: any[] } {
    const sql = this.strings.reduce((prev, curr, i) => {
      if (i === 0) return curr;
      return prev + '$' + i + curr;
    }, '');
    return {
      sql,
      values: this.values,
    };
  }

  /**
   * Append another SQL statement or string
   */
  append(statement: SQLStatement | string): this {
    if (statement instanceof SQLStatement) {
      // Merge the last string of this with the first string of statement
      const lastIdx = this.strings.length - 1;
      const firstString = statement.strings[0] || '';
      this.strings[lastIdx] = (this.strings[lastIdx] || '') + firstString;
      this.strings.push(...statement.strings.slice(1));
      this.values.push(...statement.values);
    } else {
      // Just append a string to the last segment
      const lastIdx = this.strings.length - 1;
      this.strings[lastIdx] = (this.strings[lastIdx] || '') + statement;
    }
    return this;
  }

  /**
   * Get the raw values array
   */
  getValues(): any[] {
    return this.values;
  }

  /**
   * Get the number of parameters
   */
  get paramCount(): number {
    return this.values.length;
  }
}

/**
 * Tagged template function for SQL queries
 *
 * @example
 * const name = 'John';
 * const age = 30;
 * const query = SQL`SELECT * FROM users WHERE name = ${name} AND age = ${age}`;
 */
export function SQL(strings: TemplateStringsArray, ...values: any[]): SQLStatement {
  return new SQLStatement(Array.from(strings), values);
}

export default SQL;
