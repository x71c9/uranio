/**
 *
 * Types module
 *
 * @packageDocumentation
 *
 */

import {Query} from './query';
export {Query};

export interface Atom {
  _id: string;
}

export type Shape<A extends Atom> = Omit<A, '_id'>;
