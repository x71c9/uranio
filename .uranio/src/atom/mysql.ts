/**
 *
 * MySQL Atom client module
 *
 */


import {MySQLClient} from '../client/mysql';
import * as sql from '../sql/index';

import * as atom_types from '../types/atom';
import * as where_types from '../types/where';
import * as sql_types from '../types/sql';

export class MySQLAtomClient<S extends atom_types.mysql_atom> {

  constructor(
    public client: MySQLClient,
    public name: string
  ) {}

  public async getAtom(where: where_types.Where<S>): Promise<S | null> {
    const {query, map} = sql.param.compose_select({
      table: this.name,
      where,
      limit: '1',
    });
    const [rows] = await this.client.exe(query, map);
    if (Array.isArray(rows) && rows[0]) {
      return rows[0] as S;
    }
    return null;
  }

  public async getAtoms({
    where,
    order,
    limit,
  }: {
    where?: where_types.Where<S>;
    order?: sql_types.OrderBy;
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

  public async putAtom(shape: Partial<S>): Promise<any> {
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

  public async putAtoms(shapes: Partial<S>[]): Promise<any> {
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

  public async updateAtoms(
    atom: Partial<S>,
    where?: where_types.Where<S>,
  ): Promise<any> {
    const {query, map} = sql.param.compose_update({
      table: this.name,
      where,
      update: atom
    });
    const response = await this.client.exe(query, map);
    return response;
  }

  public async deleteAtoms(where: where_types.Where<S>): Promise<any> {
    const {query, map} = sql.param.compose_delete({
      table: this.name,
      where,
    });
    const response = await this.client.exe(query, map);
    return response;
  }
}
