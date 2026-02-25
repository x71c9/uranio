import {describe, it} from 'node:test';
import assert from 'node:assert';

import * as sql from '../src/sql/index';

type ATable = {
  _id: string
  foo: number
  boo: string
}

describe('Testing SQL param query SELECT', () => {
  it('should generate the same query SELECT', () => {
    const projection = ['foo', 'boo'];
    const table = 'a-table';
    const where = {foo: {$gt: 2, $lte: 100}, boo: 'str'};
    const order = {foo: 'desc'} as const;
    const limit = '10, 100';
    const {query} = sql.param.compose_select<ATable>({
      projection,
      table,
      where,
      order,
      limit
    });
    let final_query = '';
    final_query += 'SELECT foo, boo FROM `a-table` WHERE';
    final_query += ' `foo` > :x0002 AND `foo` <= :x0003 AND `boo` = :x0004';
    final_query += ' ORDER BY `foo` DESC LIMIT 10, :x0003';
    assert.strictEqual(query, final_query);
  });
});

describe('Testing SQL param query UPDATE', () => {
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
    const {query} = sql.param.compose_update<ATable>({
      table,
      update,
      where
    });
    let final_query = '';
    final_query += 'UPDATE `uranio-table` SET boo = :x0016, foo = :x0014 WHERE';
    final_query += ' (`boo` = :x0012 OR `boo` IN :x0013 OR';
    final_query += ' (`foo` = :x0014 AND `foo` = :x0015))';
    assert.strictEqual(query, final_query);
  });
});

describe('Testing SQL param query DELETE', () => {
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
    const {query} = sql.param.compose_delete<ATable>({
      table,
      where
    });
    let final_query = '';
    final_query += 'DELETE FROM `uranio-table` WHERE';
    final_query += ' (`boo` = :x0025 OR `boo` IN :x0026 OR';
    final_query += ' (`foo` = :x0027 AND `foo` = :x0028))';
    assert.strictEqual(query, final_query);
  });
});

describe('Testing SQL param query INSERT', () => {
  it('should generate the same query INSERT', () => {
    const table = 'uranio-table';
    const columns = ['boo', 'foo'] as (keyof ATable)[];
    const records = [
      {boo: 'u', foo: 9},
      {boo: 'w', foo: 19},
    ];
    const {query} = sql.param.compose_insert<ATable>({
      table,
      columns,
      records
    });
    let final_query = '';
    final_query += 'INSERT INTO `uranio-table` (`boo`, `foo`) VALUES (:x0029, :x0030), (:x0031, :x0032)';
    assert.strictEqual(query, final_query);
  });
});
