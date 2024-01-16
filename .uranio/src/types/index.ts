/**
 *
 * Types module
 *
 * @packageDocumentation
 *
 */

export * from './where';

export * from './atom';

export * from './sql';

export interface atom {
  _id: string
}

export type unique<T> = T & {__uranio: 'unique'};

export type Shape<A extends atom> = Omit<A, '_id'>;

// export type primary<T> = T & {__uranio: 'primary'};

// type PrimaryAttribute<A extends atom> = {
//   [K in keyof A]: A[K] extends {__uranio: 'primary'} ? K : never;
// }[keyof A];

// export type Shape<A extends atom> = Omit<A, PrimaryAttribute<A>>;

