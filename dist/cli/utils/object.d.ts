/**
 *
 * Utils object module
 *
 * @packageDocumentation
 *
 */
export type NoUndefinedProperties<T> = {
    [P in keyof T]: NonNullable<T[P]>;
};
export declare function no_undefined<T extends object>(obj: T): NoUndefinedProperties<T>;
export declare function deep_clone<T>(obj: T): T;
