/**
 *
 * DynamoDB type module
 *
 * @packageDocumentation
 */
export type AttrType = 'S' | 'N' | 'B';
export type AttrValue<T extends AttrType> = T extends 'S' ? string : T extends 'N' ? number : T extends 'B' ? boolean : never;
