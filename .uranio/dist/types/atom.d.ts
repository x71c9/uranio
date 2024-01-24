/**
 *
 * Atom client interface module
 *
 * @packageDocumentation
 *
 */
import { ObjectId } from 'mongodb';
export interface atom {
}
export type primary<T> = T;
export type mongodb_id = ObjectId;
export interface mysql_atom extends atom {
}
export interface mongodb_atom extends atom {
    _id: primary<string>;
}
