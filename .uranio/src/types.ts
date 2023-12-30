/**
 *
 * Types module
 *
 * @packageDocumentation
 *
 */

export * from './query';

export interface atom {
  _id: string
}

// export type primary<T> = T & {__uranio: 'primary'};

export type unique<T> = T & {__uranio: 'unique'};

// type PrimaryAttribute<A extends atom> = {
//   [K in keyof A]: A[K] extends {__uranio: 'primary'} ? K : never;
// }[keyof A];

// export type Shape<A extends atom> = Omit<A, PrimaryAttribute<A>>;

export type Shape<A extends atom> = Omit<A, '_id'>;
