/**
 *
 * Atom client interface module
 *
 * @packageDocumentation
 *
 */

import {atom, Where, Shape} from './index';

export interface AtomClient<S extends atom> {
  get_item(where: Where<S>): Promise<S | null>;
  get_items(where: Where<S>): Promise<S[]>;
  put_item(shape: Shape<S>): Promise<any>;
  put_items(atoms: Shape<S>[]): Promise<any>;
  update_item(where: Where<S>, atom: Partial<S>): Promise<any>;
  update_items(where: Where<S>, atom: Partial<S>): Promise<any>;
  delete_item(where: Where<S>): Promise<any>;
  delete_items(where: Where<S>): Promise<any>;
}
