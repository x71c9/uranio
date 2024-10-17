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

export function no_undefined<T extends object>(
  obj: T
): NoUndefinedProperties<T> {
  return JSON.parse(JSON.stringify(obj));
}

export function deep_clone<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    return obj;
  }
  // return JSON.parse(JSON.stringify(obj));
  return structuredClone(obj);
}
