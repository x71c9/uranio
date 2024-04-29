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
    get_atom_by_primary_index<I extends dynamodb_types.AttrType>({ attribute_name, attribute_type, attribute_value, }: {
        attribute_name: string;
        attribute_type: I;
        attribute_value: dynamodb_types.AttrValue<I>;
    }): Promise<S | null>;
    get_atom_by_global_secondary_index<I extends dynamodb_types.AttrType>({ index_name, attribute_name, attribute_type, attribute_value, }: {
        index_name: string;
        attribute_name: string;
        attribute_type: I;
        attribute_value: dynamodb_types.AttrValue<I>;
    }): Promise<S | null>;
    put_atom(shape: Partial<S>): Promise<import("@aws-sdk/client-dynamodb").PutItemCommandOutput>;
    update_atom_by_primary_index<I extends dynamodb_types.AttrType>({ attribute_name, attribute_type, attribute_value, item, }: {
        attribute_name: string;
        attribute_type: I;
        attribute_value: dynamodb_types.AttrValue<I>;
        item: Record<string, any>;
    }): Promise<import("@aws-sdk/client-dynamodb").UpdateItemCommandOutput>;
    delete_atom_by_primary_index<I extends dynamodb_types.AttrType>({ attribute_name, attribute_type, attribute_value, }: {
        attribute_name: string;
        attribute_type: I;
        attribute_value: dynamodb_types.AttrValue<I>;
    }): Promise<import("@aws-sdk/client-dynamodb").DeleteItemCommandOutput>;
    is_primary_index_value_unique<I extends dynamodb_types.AttrType>({ attribute_name, attribute_type, attribute_value, }: {
        attribute_name: string;
        attribute_type: I;
        attribute_value: dynamodb_types.AttrValue<I>;
    }): Promise<boolean>;
    is_secondary_global_index_value_unique<I extends dynamodb_types.AttrType>({ index_name, attribute_name, attribute_type, attribute_value, }: {
        index_name: string;
        attribute_name: string;
        attribute_type: I;
        attribute_value: dynamodb_types.AttrValue<I>;
    }): Promise<boolean>;
    get_by_partition_key<I extends dynamodb_types.AttrType>({ attribute_name, attribute_type, attribute_value, }: {
        attribute_name: string;
        attribute_type: I;
        attribute_value: dynamodb_types.AttrValue<I>;
    }): Promise<S[]>;
}
export declare class DynamoDBAtomWithIdClient<T extends Record<string, any>> extends DynamoDBAtomClient<T> {
    get_atom_by_id(id: string): Promise<T | null>;
    update_atom_by_id(id: string, item: Record<string, any>): Promise<import("@aws-sdk/client-dynamodb").UpdateItemCommandOutput>;
    delete_by_id(id: string): Promise<import("@aws-sdk/client-dynamodb").DeleteItemCommandOutput>;
    is_id_unique(id: string): Promise<boolean>;
}
export declare class DynamoDBAtomWithCompositePrimaryKeyClient<T extends Record<string, any>> extends DynamoDBAtomClient<T> {
    get_atom_by_composite_primary_key<P extends dynamodb_types.AttrType, S extends dynamodb_types.AttrType>({ partition_key_name, partition_key_type, partition_key_value, sort_key_name, sort_key_type, sort_key_value, }: {
        partition_key_name: string;
        partition_key_type: P;
        partition_key_value: dynamodb_types.AttrValue<P>;
        sort_key_name: string;
        sort_key_type: S;
        sort_key_value: dynamodb_types.AttrValue<S>;
    }): Promise<T | null>;
    update_by_composite_primary_index<P extends dynamodb_types.AttrType, S extends dynamodb_types.AttrType>({ partition_key_name, partition_key_type, partition_key_value, sort_key_name, sort_key_type, sort_key_value, item, }: {
        partition_key_name: string;
        partition_key_type: P;
        partition_key_value: dynamodb_types.AttrValue<P>;
        sort_key_name: string;
        sort_key_type: S;
        sort_key_value: dynamodb_types.AttrValue<S>;
        item: Record<string, any>;
    }): Promise<import("@aws-sdk/client-dynamodb").UpdateItemCommandOutput>;
    delete_by_composite_key<P extends dynamodb_types.AttrType, S extends dynamodb_types.AttrType>({ partition_key_name, partition_key_type, partition_key_value, sort_key_name, sort_key_type, sort_key_value, }: {
        partition_key_name: string;
        partition_key_type: P;
        partition_key_value: dynamodb_types.AttrValue<P>;
        sort_key_name: string;
        sort_key_type: S;
        sort_key_value: dynamodb_types.AttrValue<S>;
    }): Promise<import("@aws-sdk/client-dynamodb").DeleteItemCommandOutput>;
}
