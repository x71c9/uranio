import {describe, it} from 'node:test';
import assert from 'node:assert';

import * as sql from '../src/sql/index';

type ATable = {
  _id: string
  foo: number
  boo: string
}

describe('Testing SQL full query SELECT', () => {
  it('should generate the same query SELECT', () => {
    let final_query = '';
    final_query += 'SELECT foo, boo FROM `a-table` WHERE';
    final_query += ' `foo` > 2 AND `foo` <= 100 AND `boo` = "str"';
    final_query += ' ORDER BY `foo` DESC';
    final_query += ' LIMIT 10, 100';
    const projection = ['foo', 'boo'];
    const table = 'a-table';
    const where = {foo: {$gt: 2, $lte: 100}, boo: 'str'};
    const order = {foo: 'desc'} as const;
    const limit = '10, 100';
    const full_query = sql.full.compose_select<ATable>({
      projection,
      table,
      where,
      order,
      limit
    });
    assert.strictEqual(final_query, full_query);
  });
  it('should generate the same query SELECT', () => {
    let final_query = '';
    final_query += 'SELECT foo, boo FROM `a-table` WHERE';
    final_query += ' (`foo` > 2 AND `foo` <= 100 AND `boo` = "123")';
    final_query += ' ORDER BY `foo` DESC';
    final_query += ' LIMIT 10, 100';
    const projection = ['foo', 'boo'];
    const table = 'a-table';
    const where = {$and: [{foo: {$gt: 2}}, {foo: {$lte: 100}}, {boo: '123'}]};
    const order = {foo: 'desc'} as const;
    const limit = '10, 100';
    const full_query = sql.full.compose_select<ATable>({
      projection,
      table,
      where,
      order,
      limit
    });
    assert.strictEqual(final_query, full_query);
  });
  it('should generate the same query SELECT', () => {
    let final_query = '';
    final_query += 'SELECT foo, boo FROM `a-table` WHERE';
    final_query += ' (`boo` = "a" OR `boo` IN [1,2,3])';
    final_query += ' ORDER BY `foo` DESC';
    final_query += ' LIMIT 10, 100';
    const projection = ['foo', 'boo'];
    const table = 'a-table';
    const where = {$or: [{boo: 'a'}, {boo: {$in: ['1','2','3']}}]};
    const order = {foo: 'desc'} as const;
    const limit = '10, 100';
    const full_query = sql.full.compose_select<ATable>({
      projection,
      table,
      where,
      order,
      limit
    });
    assert.strictEqual(final_query, full_query);
  });
  it('should generate the same query SELECT', () => {
    let final_query = '';
    final_query += 'SELECT * FROM `a-table` WHERE';
    final_query += ' (';
    final_query += '`boo` = "a" OR `boo` IN [1,2,3]';
    final_query += ' OR';
    final_query += ' (`foo` = 2 AND `foo` = 1)'
    final_query += ')';
    const table = 'a-table';
    const where = {
      $or: [
        {boo: 'a'},
        {boo: {$in: ['1','2','3']}},
        {
          $and: [
            {foo: 2},{foo: 1}
          ]
        },
      ]
    };
    const full_query = sql.full.compose_select<ATable>({
      table,
      where,
    });
    assert.strictEqual(final_query, full_query);
  });
});

describe('Testing SQL full query UPDATE', () => {
  it('should generate the same query UPDATE', () => {
    const table = 'uranio-table';
    const update = {
      boo: '1',
      foo: 2
    };
    const where = {
      $or: [
        {boo: 'a'},
        {boo: {$in: ['1','2','3']}},
        {
          $and: [
            {foo: 2},{foo: 1}
          ]
        },
      ]
    };
    const full_query = sql.full.compose_update<ATable>({
      table,
      update,
      where
    });
    let final_query = '';
    final_query += 'UPDATE `uranio-table` SET';
    final_query += ' boo = "1", foo = 2 WHERE';
    final_query += ' (';
    final_query += '`boo` = "a" OR `boo` IN [1,2,3]';
    final_query += ' OR ';
    final_query += '(`foo` = 2 AND `foo` = 1)';
    final_query += ')';
    assert.strictEqual(final_query, full_query);
  });
});

describe('Testing SQL full query DELETE', () => {
  it('should generate the same query DELETE', () => {
    const table = 'uranio-table';
    const where = {
      $or: [
        {boo: 'a'},
        {boo: {$in: ['1','2','3']}},
        {
          $and: [
            {foo: 2},{foo: 1}
          ]
        },
      ]
    };
    const full_query = sql.full.compose_delete<ATable>({
      table,
      where
    });
    let final_query = '';
    final_query += 'DELETE FROM `uranio-table`';
    final_query += ' WHERE';
    final_query += ' (';
    final_query += '`boo` = "a" OR `boo` IN [1,2,3]';
    final_query += ' OR ';
    final_query += '(`foo` = 2 AND `foo` = 1)';
    final_query += ')';
    assert.strictEqual(final_query, full_query);
  });
});

describe('Testing SQL full query INSERT', () => {
  it('should generate the same query INSERT', () => {
    const table = 'uranio-table';
    const columns = ['boo', 'foo'] as (keyof ATable)[];
    const records = [
      {boo: 'u', foo: 9},
      {boo: 'w', foo: 19},
    ];
    const full_query = sql.full.compose_insert<ATable>({
      table,
      columns,
      records
    });
    let final_query = '';
    final_query += 'INSERT INTO `uranio-table` (`boo`, `foo`)';
    final_query += ' VALUES';
    final_query += ' ("u", 9), ("w", 19)';
    assert.strictEqual(final_query, full_query);
  });
});
