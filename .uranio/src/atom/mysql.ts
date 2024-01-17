/**
 *
 * MySQL Atom client module
 *
 */

// import mysql from 'mysql2/promise';

// import {log} from './log/index';

import {MySQLClient} from '../client/mysql';

import * as sql from '../sql/index';
import * as t from '../types/index';

// export class MySQLAtomClient<S extends t.atom> implements t.AtomClient<S> {

export class MySQLAtomClient<S extends t.mysql_atom> {

  constructor(
    public client: MySQLClient,
    public name: string
  ) {}

  public async get_atom(where: t.Where<S>): Promise<S | null> {
    const {query, map} = sql.param.compose_select({
      table: this.name,
      where,
      limit: 'LIMIT 1',
    });
    const [rows] = await this.client.exe(query, map);
    if (Array.isArray(rows) && rows[0]) {
      return rows[0] as S;
    }
    return null;
  }

  public async get_atoms({
    where,
    order,
    limit,
  }: {
    where?: t.Where<S>;
    order?: t.OrderBy;
    limit?: string;
  }): Promise<S[]> {
    const {query, map} = sql.param.compose_select({
      table: this.name,
      where,
      order,
      limit,
    });
    const [rows] = await this.client.exe(query, map);
    if (Array.isArray(rows)) {
      return rows as S[];
    }
    return [];
  }

  public async put_atom(shape: Partial<S>): Promise<any> {
    const columns:(keyof S)[] = [];
    for(const [key, _] of Object.entries(shape)){
      columns.push(key as keyof S);
    }
    const {query, query_records} = sql.param.compose_insert({
      table: this.name,
      columns,
      records: [shape]
    });
    const response = await this.client.exe(query, query_records);
    return response;
  }

  public async put_atoms(shapes: Partial<S>[]): Promise<any> {
    const columns:(keyof S)[] = [];
    if(!Array.isArray(shapes) || shapes.length < 1 || !shapes[0]){
      return null;
    }
    for(const [key, _] of Object.entries(shapes[0])){
      columns.push(key as keyof S);
    }
    const {query, query_records} = sql.param.compose_insert({
      table: this.name,
      columns,
      records: shapes
    });
    const response = await this.client.exe(query, query_records);
    return response;
  }

  public async update_atoms(
    atom: Partial<S>,
    where?: t.Where<S>,
  ): Promise<any> {
    const {query, map} = sql.param.compose_update({
      table: this.name,
      where,
      update: atom
    });
    const response = await this.client.exe(query, map);
    return response;
  }

  public async delete_atoms(where: t.Where<S>): Promise<any> {
    const {query, map} = sql.param.compose_delete({
      table: this.name,
      where,
    });
    const response = await this.client.exe(query, map);
    return response;
  }
}
