/**
 *
 * DynamoDB Atom client module
 *
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import * as atom_types from '../types/atom';
import * as dynamodb_types from '../types/dynamodb';
export declare class DynamoDBAtomClient<S extends atom_types.dynamodb_atom> {
    client: DynamoDBClient;
    name: string;
    constructor(client: DynamoDBClient, name: string);
    getAtomByPrimaryIndex<I extends dynamodb_types.AttrType>({ attribute_name, attribute_type, attribute_value, }: {
        attribute_name: string;
        attribute_type: I;
        attribute_value: dynamodb_types.AttrValue<I>;
    }): Promise<S | null>;
    getAtomByGlobalSecondaryIndex<I extends dynamodb_types.AttrType>({ index_name, attribute_name, attribute_type, attribute_value, }: {
        index_name: string;
        attribute_name: string;
        attribute_type: I;
        attribute_value: dynamodb_types.AttrValue<I>;
    }): Promise<S | null>;
    putAtom(shape: Partial<S>): Promise<any>;
    updateAtomByPrimaryIndex<I extends dynamodb_types.AttrType>({ attribute_name, attribute_type, attribute_value, item, }: {
        attribute_name: string;
        attribute_type: I;
        attribute_value: dynamodb_types.AttrValue<I>;
        item: Record<string, any>;
    }): Promise<any>;
    deleteAtomByPrimaryIndex<I extends dynamodb_types.AttrType>({ attribute_name, attribute_type, attribute_value, }: {
        attribute_name: string;
        attribute_type: I;
        attribute_value: dynamodb_types.AttrValue<I>;
    }): Promise<any>;
    isPrimaryIndexValueUnique<I extends dynamodb_types.AttrType>({ attribute_name, attribute_type, attribute_value, }: {
        attribute_name: string;
        attribute_type: I;
        attribute_value: dynamodb_types.AttrValue<I>;
    }): Promise<boolean>;
    isSecondaryGlobalIndexValueUnique<I extends dynamodb_types.AttrType>({ index_name, attribute_name, attribute_type, attribute_value, }: {
        index_name: string;
        attribute_name: string;
        attribute_type: I;
        attribute_value: dynamodb_types.AttrValue<I>;
    }): Promise<boolean>;
    getByPartitionKey<I extends dynamodb_types.AttrType>({ attribute_name, attribute_type, attribute_value, }: {
        attribute_name: string;
        attribute_type: I;
        attribute_value: dynamodb_types.AttrValue<I>;
    }): Promise<S[]>;
}
export declare class DynamoDBAtomWithIdClient<T extends Record<string, any>> extends DynamoDBAtomClient<T> {
    getAtomById(id: string): Promise<T | null>;
    updateAtomById(id: string, item: Record<string, any>): Promise<any>;
    deleteById(id: string): Promise<any>;
    isIdUnique(id: string): Promise<boolean>;
}
export declare class DynamoDBAtomWithCompositePrimaryKeyClient<T extends Record<string, any>> extends DynamoDBAtomClient<T> {
    getAtomByCompositePrimaryKey<P extends dynamodb_types.AttrType, S extends dynamodb_types.AttrType>({ partition_key_name, partition_key_type, partition_key_value, sort_key_name, sort_key_type, sort_key_value, }: {
        partition_key_name: string;
        partition_key_type: P;
        partition_key_value: dynamodb_types.AttrValue<P>;
        sort_key_name: string;
        sort_key_type: S;
        sort_key_value: dynamodb_types.AttrValue<S>;
    }): Promise<T | null>;
    updateByCompositePrimaryIndex<P extends dynamodb_types.AttrType, S extends dynamodb_types.AttrType>({ partition_key_name, partition_key_type, partition_key_value, sort_key_name, sort_key_type, sort_key_value, item, }: {
        partition_key_name: string;
        partition_key_type: P;
        partition_key_value: dynamodb_types.AttrValue<P>;
        sort_key_name: string;
        sort_key_type: S;
        sort_key_value: dynamodb_types.AttrValue<S>;
        item: Record<string, any>;
    }): Promise<any>;
    deleteByCompositeKey<P extends dynamodb_types.AttrType, S extends dynamodb_types.AttrType>({ partition_key_name, partition_key_type, partition_key_value, sort_key_name, sort_key_type, sort_key_value, }: {
        partition_key_name: string;
        partition_key_type: P;
        partition_key_value: dynamodb_types.AttrValue<P>;
        sort_key_name: string;
        sort_key_type: S;
        sort_key_value: dynamodb_types.AttrValue<S>;
    }): Promise<any>;
}
