/**
 *
 * DynamoDB type module
 *
 * @packageDocumentation
 */
export type AttrType = 'S' | 'N' | 'BOOL' | 'NULL' | 'M' | 'SS' | 'NS' | 'L';
export type AttrValue<T extends AttrType> = T extends 'S' ? string : T extends 'N' ? number : T extends 'BOOL' ? boolean : T extends 'NULL' ? null : T extends 'M' ? object : T extends 'SS' ? string[] : T extends 'NS' ? number[] : T extends 'L' ? any[] : never;
