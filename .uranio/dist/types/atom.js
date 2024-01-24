"use strict";
/**
 *
 * Atom client interface module
 *
 * @packageDocumentation
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
// export type unique<T> = T & {__uranio: 'unique'};
// export type primary<T> = T & {__uranio: 'primary'};
// type PrimaryAttribute<A extends atom> = {
//   [K in keyof A]: A[K] extends {__uranio: 'primary'} ? K : never;
// }[keyof A];
// export type Shape<A extends atom> = Omit<A, PrimaryAttribute<A>>;
// export type Shape<A extends atom> = Omit<A, '_id'>;
// import {atom, Where, Shape, OrderBy} from './index';
// export interface AtomClient<S extends atom> {
//   get_atom(where: Where<S>): Promise<S | null>;
//   get_atoms({
//     where,
//     order,
//     limit
//   }:{
//     where: Where<S>,
//     order?: OrderBy,
//     limit?: string
//   }): Promise<S[]>;
//   put_atom(shape: Shape<S>): Promise<any>;
//   put_atoms(atoms: Shape<S>[]): Promise<any>;
//   update_atom(where: Where<S>, atom: Partial<S>): Promise<any>;
//   update_atoms(where: Where<S>, atom: Partial<S>): Promise<any>;
//   delete_atom(where: Where<S>): Promise<any>;
//   delete_atoms(where: Where<S>): Promise<any>;
// }
//# sourceMappingURL=atom.js.map