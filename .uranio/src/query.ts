/**
 *
 * Query type module
 *
 */

import {atom} from './types';

export type Query<A extends atom> = {
  [P in keyof A]?: Condition<A[P]>;
} & RootFilterOperators<A>;

type Condition<T> = AlternativeType<T> | FilterOperators<AlternativeType<T>>;

type AlternativeType<T> = T extends ReadonlyArray<infer U>
  ? T | RegExpOrString<U>
  : RegExpOrString<T>;

type RegExpOrString<T> = T extends string ? RegExp | T : T;

interface FilterOperators<T> {
  $eq?: T;
  $gt?: T;
  $gte?: T;
  $in?: ReadonlyArray<T>;
  $lt?: T;
  $lte?: T;
  $ne?: T;
  $nin?: ReadonlyArray<T>;
  $not?: T extends string ? FilterOperators<T> | RegExp : FilterOperators<T>;
  $exists?: boolean;
  $expr?: Record<string, any>;
  $jsonSchema?: Record<string, any>;
  $mod?: T extends number ? [number, number] : never;
  $regex?: T extends string ? RegExp | string : never;
  $options?: T extends string ? string : never;
  $maxDistance?: number;
  $all?: ReadonlyArray<any>;
  $size?: T extends ReadonlyArray<any> ? number : never;
  $rand?: Record<string, never>;
}

interface RootFilterOperators<A extends atom> {
  $and?: Query<A>[];
  $nor?: Query<A>[];
  $or?: Query<A>[];
  $text?: {
    $search: string;
    $language?: string;
    $caseSensitive?: boolean;
    $diacriticSensitive?: boolean;
  };
  $where?: string | ((this: A) => boolean);
  $comment?: string;
}

