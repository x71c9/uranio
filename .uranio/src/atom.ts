/**
 *
 * Atom client interface module
 *
 * @packageDocumentation
 *
 */

import {atom, Query, Shape} from './types';

export interface AtomClient<S extends atom> {
  get_item(query: Query<S>): Promise<S | null>;
  get_items(query: Query<S>): Promise<S[]>;
  put_item(shape: Shape<S>): Promise<any>;
  put_items(atoms: Shape<S>[]): Promise<any>;
  update_item(query: Query<S>, atom: Partial<S>): Promise<any>;
  update_items(query: Query<S>, atom: Partial<S>): Promise<any>;
  delete_item(query: Query<S>): Promise<any>;
  delete_items(query: Query<S>): Promise<any>;
}
