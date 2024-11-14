/**
 *
 * DynamoDB Atom client module
 *
 */

import {
  DynamoDBClient,
  AttributeValue,
  GetItemCommand,
  GetItemCommandInput,
  UpdateItemCommand,
  UpdateItemCommandInput,
  PutItemCommand,
  PutItemCommandInput,
  QueryCommandInput,
  QueryCommand,
  DeleteItemCommand,
  DeleteItemCommandInput,
} from '@aws-sdk/client-dynamodb';

import {unmarshall} from '@aws-sdk/util-dynamodb';

import * as atom_types from '../types/atom';
import * as dynamodb_types from '../types/dynamodb';

export class DynamoDBAtomClient<S extends atom_types.dynamodb_atom> {
  constructor(public client: DynamoDBClient, public name: string) {}

  async get_atom_by_primary_index<I extends dynamodb_types.AttrType>({
    attribute_name,
    attribute_type,
    attribute_value,
  }: {
    attribute_name: string;
    attribute_type: I;
    attribute_value: dynamodb_types.AttrValue<I>;
  }): Promise<S | null> {
    const params: GetItemCommandInput = {
      TableName: this.name,
      Key: {
        [attribute_name]: {[attribute_type]: attribute_value},
      },
    } as unknown as GetItemCommandInput;
    // log.trace(`GET ITEM BY PRIMARY INDEX PARAMS: `, params);
    const command = new GetItemCommand(params);
    const response = await this.client.send(command);
    // log.trace(`GET ITEM BY PRIMARY INDEX RESPONSE: `, response);
    if (!response.Item) {
      return null;
    }
    const unmarshalled = unmarshall(response.Item);
    return unmarshalled as S;
  }

  async get_atom_by_global_secondary_index<I extends dynamodb_types.AttrType>({
    index_name,
    attribute_name,
    attribute_type,
    attribute_value,
  }: {
    index_name: string;
    attribute_name: string;
    attribute_type: I;
    attribute_value: dynamodb_types.AttrValue<I>;
  }): Promise<S | null> {
    const params: QueryCommandInput = {
      TableName: this.name,
      IndexName: index_name,
      KeyConditionExpression: `${attribute_name} = :value`,
      ExpressionAttributeValues: {
        ':value': {[attribute_type]: attribute_value},
      },
    } as unknown as QueryCommandInput;
    // log.trace(`GET ITEM BY GLOBAL SECONDARY INDEX PARAMS: `, params);
    const command = new QueryCommand(params);
    const response = await this.client.send(command);
    // log.trace(`GET ITEM BY GLOBAL SECONDARY INDEX RESPONSE: `, response);
    if (!response.Items || !Array.isArray(response.Items)) {
      throw new Error(`Invalid QueryCommand response`);
    }
    if (response.Items.length === 0) {
      return null;
    }
    const unmarshalled = unmarshall(response.Items[0]!);
    return unmarshalled as S;
  }

  async put_atom(shape: Partial<S>) {
    const dynamo_item = _resolve_dynamo_map(shape);
    const params: PutItemCommandInput = {
      TableName: this.name,
      Item: dynamo_item,
    };
    // log.trace(`PUT PARAMS: `, params);
    const putItemCommand = new PutItemCommand(params);
    const response = await this.client.send(putItemCommand);
    // log.trace(`PUT RESPONSE: `, response);
    return response;
  }

  async update_atom_by_primary_index<I extends dynamodb_types.AttrType>({
    attribute_name,
    attribute_type,
    attribute_value,
    item,
  }: {
    attribute_name: string;
    attribute_type: I;
    attribute_value: dynamodb_types.AttrValue<I>;
    item: Record<string, any>;
  }) {
    const updateExpression = Object.keys(item)
      .map((key) => `${key} = :${key}`)
      .join(', ');
    const params: UpdateItemCommandInput = {
      TableName: this.name,
      Key: {
        [attribute_name]: {
          [attribute_type]: attribute_value,
        },
      },
      UpdateExpression: `SET ${updateExpression}`,
      ExpressionAttributeValues: Object.entries(item).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [`:${key}`]: _resolve_dynamo_item_value(value, key),
        }),
        {}
      ),
    } as unknown as UpdateItemCommandInput;
    // log.trace(`UPDATE BY PRIMARY INDEX PARAMS: `, params);
    const command = new UpdateItemCommand(params);
    const respone = await this.client.send(command);
    // log.trace(`UPDATE BY PRIMARY INDEX RESPONSE: `, respone);
    return respone;
  }

  async delete_atom_by_primary_index<I extends dynamodb_types.AttrType>({
    attribute_name,
    attribute_type,
    attribute_value,
  }: {
    attribute_name: string;
    attribute_type: I;
    attribute_value: dynamodb_types.AttrValue<I>;
  }) {
    const params: DeleteItemCommandInput = {
      TableName: this.name,
      Key: {
        [attribute_name]: {[attribute_type]: attribute_value},
      },
    } as unknown as DeleteItemCommandInput;
    // log.trace(`DELETE BY PRIMARY INDEX PARAMS: `, params);
    const command = new DeleteItemCommand(params);
    const response = await this.client.send(command);
    // log.trace(`DELETE BY PRIMARY INDEX RESPONSE: `, params);
    return response;
  }

  async is_primary_index_value_unique<I extends dynamodb_types.AttrType>({
    attribute_name,
    attribute_type,
    attribute_value,
  }: {
    attribute_name: string;
    attribute_type: I;
    attribute_value: dynamodb_types.AttrValue<I>;
  }): Promise<boolean> {
    const item = await this.get_atom_by_primary_index({
      attribute_name,
      attribute_type,
      attribute_value,
    });
    if (item !== null) {
      return false;
    }
    return true;
  }

  async is_secondary_global_index_value_unique<
    I extends dynamodb_types.AttrType
  >({
    index_name,
    attribute_name,
    attribute_type,
    attribute_value,
  }: {
    index_name: string;
    attribute_name: string;
    attribute_type: I;
    attribute_value: dynamodb_types.AttrValue<I>;
  }): Promise<boolean> {
    const item = await this.get_atom_by_global_secondary_index({
      index_name,
      attribute_name,
      attribute_type,
      attribute_value,
    });
    if (item !== null) {
      return false;
    }
    return true;
  }

  public async get_by_partition_key<I extends dynamodb_types.AttrType>({
    attribute_name,
    attribute_type,
    attribute_value,
  }: {
    attribute_name: string;
    attribute_type: I;
    attribute_value: dynamodb_types.AttrValue<I>;
  }) {
    const params: QueryCommandInput = {
      TableName: this.name,
      KeyConditionExpression: `${attribute_name} = :pk`,
      ExpressionAttributeValues: {
        ':pk': {[attribute_type]: attribute_value},
      },
      ScanIndexForward: true, // Set to true for ascending order, false for descending order
    } as unknown as QueryCommandInput;
    // log.trace(`GET BY PARTITION KEY PARAMS: `, params);
    const command = new QueryCommand(params);
    const response = await this.client.send(command);
    // log.trace(`GET BY PARTITION KEY RESPONSE: `, response);
    if (!response.Items) {
      return [];
    }
    const response_items = [];
    for (const item of response.Items) {
      const unmarshalled = unmarshall(item);
      response_items.push(unmarshalled);
    }
    return response_items as S[];
  }
}

export class DynamoDBAtomWithIdClient<
  T extends Record<string, any>
> extends DynamoDBAtomClient<T> {
  public async get_atom_by_id(id: string) {
    return this.get_atom_by_primary_index({
      attribute_name: 'id',
      attribute_value: id,
      attribute_type: 'S',
    });
  }
  public async update_atom_by_id(id: string, item: Record<string, any>) {
    return this.update_atom_by_primary_index({
      attribute_name: 'id',
      attribute_value: id,
      attribute_type: 'S',
      item,
    });
  }
  public async delete_by_id(id: string) {
    return this.delete_atom_by_primary_index({
      attribute_name: 'id',
      attribute_value: id,
      attribute_type: 'S',
    });
  }
  public async is_id_unique(id: string): Promise<boolean> {
    return await this.is_primary_index_value_unique({
      attribute_name: 'id',
      attribute_type: 'S',
      attribute_value: id,
    });
  }
}

export class DynamoDBAtomWithCompositePrimaryKeyClient<
  T extends Record<string, any>
> extends DynamoDBAtomClient<T> {
  public async get_atom_by_composite_primary_key<
    P extends dynamodb_types.AttrType,
    S extends dynamodb_types.AttrType
  >({
    partition_key_name,
    partition_key_type,
    partition_key_value,
    sort_key_name,
    sort_key_type,
    sort_key_value,
  }: {
    partition_key_name: string;
    partition_key_type: P;
    partition_key_value: dynamodb_types.AttrValue<P>;
    sort_key_name: string;
    sort_key_type: S;
    sort_key_value: dynamodb_types.AttrValue<S>;
  }) {
    const params: GetItemCommandInput = {
      TableName: this.name,
      Key: {
        [partition_key_name]: {
          [partition_key_type]: partition_key_value,
        },
        [sort_key_name]: {
          [sort_key_type]: sort_key_value,
        },
      },
    } as unknown as GetItemCommandInput;
    // log.trace(`GET BY COMPOSITE KEY PARAMS: `, params);
    const command = new GetItemCommand(params);
    const response = await this.client.send(command);
    // log.trace(`GET BY COMPOSITE KEY RESPONSE: `, response);
    if (!response.Item) {
      return null;
    }
    const item = response.Item;
    const unmarshalled = unmarshall(item);
    return unmarshalled as T;
  }
  public async update_by_composite_primary_index<
    P extends dynamodb_types.AttrType,
    S extends dynamodb_types.AttrType
  >({
    partition_key_name,
    partition_key_type,
    partition_key_value,
    sort_key_name,
    sort_key_type,
    sort_key_value,
    item,
  }: {
    partition_key_name: string;
    partition_key_type: P;
    partition_key_value: dynamodb_types.AttrValue<P>;
    sort_key_name: string;
    sort_key_type: S;
    sort_key_value: dynamodb_types.AttrValue<S>;
    item: Record<string, any>;
  }) {
    const updateExpression = Object.keys(item)
      .map((key) => `${key} = :${key}`)
      .join(', ');
    const params: UpdateItemCommandInput = {
      TableName: this.name,
      Key: {
        [partition_key_name]: {
          [partition_key_type]: partition_key_value,
        },
        [sort_key_name]: {
          [sort_key_type]: sort_key_value,
        },
      },
      UpdateExpression: `SET ${updateExpression}`,
      ExpressionAttributeValues: Object.entries(item).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [`:${key}`]: _resolve_dynamo_item_value(value, key),
        }),
        {}
      ),
    } as unknown as UpdateItemCommandInput;
    // log.trace(`UPDATE BY COMPOSITE PRIMARY INDEX PARAMS: `, params);
    const command = new UpdateItemCommand(params);
    const respone = await this.client.send(command);
    // log.trace(`UPDATE BY COMPOSITE PRIMARY INDEX RESPONSE: `, respone);
    return respone;
  }
  public async delete_by_composite_key<
    P extends dynamodb_types.AttrType,
    S extends dynamodb_types.AttrType
  >({
    partition_key_name,
    partition_key_type,
    partition_key_value,
    sort_key_name,
    sort_key_type,
    sort_key_value,
  }: {
    partition_key_name: string;
    partition_key_type: P;
    partition_key_value: dynamodb_types.AttrValue<P>;
    sort_key_name: string;
    sort_key_type: S;
    sort_key_value: dynamodb_types.AttrValue<S>;
  }) {
    const params: DeleteItemCommandInput = {
      TableName: this.name,
      Key: {
        [partition_key_name]: {[partition_key_type]: partition_key_value},
        [sort_key_name]: {[sort_key_type]: sort_key_value},
      },
    } as unknown as DeleteItemCommandInput;
    // log.trace(`DELETE BY COMPOSITE INDEX PARAMS: `, params);
    const command = new DeleteItemCommand(params);
    const response = await this.client.send(command);
    // log.trace(`DELETE BY COMPOSITE INDEX RESPONSE: `, response);
    return response;
  }
}

function _dynamo_attribute_type_for(
  name: string,
  value: unknown
): dynamodb_types.AttrType {
  if (Array.isArray(value)) {
    if (_all_strings(value)) {
      return 'SS';
    }
    if (_all_numbers(value)) {
      return 'NS';
    }
    return 'L';
  } else {
    switch (typeof value) {
      case 'string': {
        return 'S';
      }
      case 'number': {
        return 'N';
      }
      case 'boolean': {
        return 'BOOL';
      }
      case 'object': {
        if (value === null) {
          return 'NULL';
        }
        return 'M';
      }
    }
  }
  throw new Error(
    `Attribute type not supported. Attribute name '${name}'` +
      ` , attribute type '${typeof value}'`
  );
}

function _resolve_dynamo_list(value: unknown[], key: string) {
  const final_list: AttributeValue[] = [];
  for (let i = 0; i < value.length; i++) {
    const list_item = value[i]!;
    const dynamo_value = _resolve_dynamo_item_value(list_item, key);
    final_list.push(dynamo_value);
  }
  return final_list;
}

function _resolve_dynamo_item_value(
  value: unknown,
  key: string
): AttributeValue {
  if (Array.isArray(value)) {
    if (_all_strings(value)) {
      return {SS: value};
    }
    if (_all_numbers(value)) {
      return {NS: value};
    }
    return {L: _resolve_dynamo_list(value, key)};
  } else {
    switch (typeof value) {
      case 'string': {
        return {S: value};
      }
      case 'number': {
        return {N: value.toString()};
      }
      case 'boolean': {
        return {BOOL: value};
      }
      case 'object': {
        if (value === null) {
          return {NULL: true};
        }
        return {M: _resolve_dynamo_map(value)};
      }
      default:
        throw new Error(
          `Unsupported attribute type '${typeof value}' for` +
            ` attribute name '${key}'`
        );
    }
  }
}

function _all_strings(arr: unknown[]): boolean {
  return arr.every((item): item is string => typeof item === 'string');
}

function _all_numbers(arr: unknown[]): boolean {
  return arr.every((item): item is number => typeof item === 'number');
}

function _resolve_dynamo_map(item: Record<string, any>) {
  const dynamo_item: {[key: string]: AttributeValue} = {};
  for (let [key, value] of Object.entries(item)) {
    const dynamo_value = _resolve_dynamo_item_value(value, key);
    if (!dynamo_value) {
      continue;
    }
    dynamo_item[key] = dynamo_value;
  }
  return dynamo_item;
}
