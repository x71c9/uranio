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
export type mongodb_id = ObjectId;
export interface mysql_atom extends atom {
}
export interface mongodb_atom extends atom {
    _id: ObjectId;
}
export interface dynamodb_atom extends atom {
}
