"use strict";
/**
 *
 * DynamoDB Atom client module
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBAtomWithCompositePrimaryKeyClient = exports.DynamoDBAtomWithIdClient = exports.DynamoDBAtomClient = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
class DynamoDBAtomClient {
    constructor(client, name) {
        this.client = client;
        this.name = name;
    }
    async get_atom_by_primary_index({ attribute_name, attribute_type, attribute_value, }) {
        const params = {
            TableName: this.name,
            Key: {
                [attribute_name]: { [attribute_type]: attribute_value },
            },
        };
        // log.trace(`GET ITEM BY PRIMARY INDEX PARAMS: `, params);
        const command = new client_dynamodb_1.GetItemCommand(params);
        const response = await this.client.send(command);
        // log.trace(`GET ITEM BY PRIMARY INDEX RESPONSE: `, response);
        if (!response.Item) {
            return null;
        }
        const unmarshalled = (0, util_dynamodb_1.unmarshall)(response.Item);
        return unmarshalled;
    }
    async get_atom_by_global_secondary_index({ index_name, attribute_name, attribute_type, attribute_value, }) {
        const params = {
            TableName: this.name,
            IndexName: index_name,
            KeyConditionExpression: `${attribute_name} = :value`,
            ExpressionAttributeValues: {
                ':value': { [attribute_type]: attribute_value },
            },
        };
        // log.trace(`GET ITEM BY GLOBAL SECONDARY INDEX PARAMS: `, params);
        const command = new client_dynamodb_1.QueryCommand(params);
        const response = await this.client.send(command);
        // log.trace(`GET ITEM BY GLOBAL SECONDARY INDEX RESPONSE: `, response);
        if (!response.Items || !Array.isArray(response.Items)) {
            throw new Error(`Invalid QueryCommand response`);
        }
        if (response.Items.length === 0) {
            return null;
        }
        const unmarshalled = (0, util_dynamodb_1.unmarshall)(response.Items[0]);
        return unmarshalled;
    }
    async put_atom(shape) {
        const dynamo_item = _resolve_dynamo_map(shape);
        const params = {
            TableName: this.name,
            Item: dynamo_item,
        };
        // log.trace(`PUT PARAMS: `, params);
        const putItemCommand = new client_dynamodb_1.PutItemCommand(params);
        const response = await this.client.send(putItemCommand);
        // log.trace(`PUT RESPONSE: `, response);
        return response;
    }
    async update_atom_by_primary_index({ attribute_name, attribute_type, attribute_value, item, }) {
        const updateExpression = Object.keys(item)
            .map((key) => `${key} = :${key}`)
            .join(', ');
        const params = {
            TableName: this.name,
            Key: {
                [attribute_name]: {
                    [attribute_type]: attribute_value,
                },
            },
            UpdateExpression: `SET ${updateExpression}`,
            ExpressionAttributeValues: Object.entries(item).reduce((acc, [key, value]) => ({
                ...acc,
                [`:${key}`]: _resolve_dynamo_item_value(value, key),
            }), {}),
        };
        // log.trace(`UPDATE BY PRIMARY INDEX PARAMS: `, params);
        const command = new client_dynamodb_1.UpdateItemCommand(params);
        const respone = await this.client.send(command);
        // log.trace(`UPDATE BY PRIMARY INDEX RESPONSE: `, respone);
        return respone;
    }
    async delete_atom_by_primary_index({ attribute_name, attribute_type, attribute_value, }) {
        const params = {
            TableName: this.name,
            Key: {
                [attribute_name]: { [attribute_type]: attribute_value },
            },
        };
        // log.trace(`DELETE BY PRIMARY INDEX PARAMS: `, params);
        const command = new client_dynamodb_1.DeleteItemCommand(params);
        const response = await this.client.send(command);
        // log.trace(`DELETE BY PRIMARY INDEX RESPONSE: `, params);
        return response;
    }
    async is_primary_index_value_unique({ attribute_name, attribute_type, attribute_value, }) {
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
    async is_secondary_global_index_value_unique({ index_name, attribute_name, attribute_type, attribute_value, }) {
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
    async get_by_partition_key({ attribute_name, attribute_type, attribute_value, }) {
        const params = {
            TableName: this.name,
            KeyConditionExpression: `${attribute_name} = :pk`,
            ExpressionAttributeValues: {
                ':pk': { [attribute_type]: attribute_value },
            },
            ScanIndexForward: true, // Set to true for ascending order, false for descending order
        };
        // log.trace(`GET BY PARTITION KEY PARAMS: `, params);
        const command = new client_dynamodb_1.QueryCommand(params);
        const response = await this.client.send(command);
        // log.trace(`GET BY PARTITION KEY RESPONSE: `, response);
        if (!response.Items) {
            return [];
        }
        const response_items = [];
        for (const item of response.Items) {
            const unmarshalled = (0, util_dynamodb_1.unmarshall)(item);
            response_items.push(unmarshalled);
        }
        return response_items;
    }
}
exports.DynamoDBAtomClient = DynamoDBAtomClient;
class DynamoDBAtomWithIdClient extends DynamoDBAtomClient {
    async get_atom_by_id(id) {
        return this.get_atom_by_primary_index({
            attribute_name: 'id',
            attribute_value: id,
            attribute_type: 'S',
        });
    }
    async update_atom_by_id(id, item) {
        return this.update_atom_by_primary_index({
            attribute_name: 'id',
            attribute_value: id,
            attribute_type: 'S',
            item,
        });
    }
    async delete_by_id(id) {
        return this.delete_atom_by_primary_index({
            attribute_name: 'id',
            attribute_value: id,
            attribute_type: 'S',
        });
    }
    async is_id_unique(id) {
        return await this.is_primary_index_value_unique({
            attribute_name: 'id',
            attribute_type: 'S',
            attribute_value: id,
        });
    }
}
exports.DynamoDBAtomWithIdClient = DynamoDBAtomWithIdClient;
class DynamoDBAtomWithCompositePrimaryKeyClient extends DynamoDBAtomClient {
    async get_atom_by_composite_primary_key({ partition_key_name, partition_key_type, partition_key_value, sort_key_name, sort_key_type, sort_key_value, }) {
        const params = {
            TableName: this.name,
            Key: {
                [partition_key_name]: {
                    [partition_key_type]: partition_key_value,
                },
                [sort_key_name]: {
                    [sort_key_type]: sort_key_value,
                },
            },
        };
        // log.trace(`GET BY COMPOSITE KEY PARAMS: `, params);
        const command = new client_dynamodb_1.GetItemCommand(params);
        const response = await this.client.send(command);
        // log.trace(`GET BY COMPOSITE KEY RESPONSE: `, response);
        if (!response.Item) {
            return null;
        }
        const item = response.Item;
        const unmarshalled = (0, util_dynamodb_1.unmarshall)(item);
        return unmarshalled;
    }
    async update_by_composite_primary_index({ partition_key_name, partition_key_type, partition_key_value, sort_key_name, sort_key_type, sort_key_value, item, }) {
        const updateExpression = Object.keys(item)
            .map((key) => `${key} = :${key}`)
            .join(', ');
        const params = {
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
            ExpressionAttributeValues: Object.entries(item).reduce((acc, [key, value]) => ({
                ...acc,
                [`:${key}`]: _resolve_dynamo_item_value(value, key),
            }), {}),
        };
        // log.trace(`UPDATE BY COMPOSITE PRIMARY INDEX PARAMS: `, params);
        const command = new client_dynamodb_1.UpdateItemCommand(params);
        const respone = await this.client.send(command);
        // log.trace(`UPDATE BY COMPOSITE PRIMARY INDEX RESPONSE: `, respone);
        return respone;
    }
    async delete_by_composite_key({ partition_key_name, partition_key_type, partition_key_value, sort_key_name, sort_key_type, sort_key_value, }) {
        const params = {
            TableName: this.name,
            Key: {
                [partition_key_name]: { [partition_key_type]: partition_key_value },
                [sort_key_name]: { [sort_key_type]: sort_key_value },
            },
        };
        // log.trace(`DELETE BY COMPOSITE INDEX PARAMS: `, params);
        const command = new client_dynamodb_1.DeleteItemCommand(params);
        const response = await this.client.send(command);
        // log.trace(`DELETE BY COMPOSITE INDEX RESPONSE: `, response);
        return response;
    }
}
exports.DynamoDBAtomWithCompositePrimaryKeyClient = DynamoDBAtomWithCompositePrimaryKeyClient;
// function _dynamo_attribute_type_for(
//   name: string,
//   value: unknown
// ): dynamodb_types.AttrType {
//   if (Array.isArray(value)) {
//     if (_all_strings(value)) {
//       return 'SS';
//     }
//     if (_all_numbers(value)) {
//       return 'NS';
//     }
//     return 'L';
//   } else {
//     switch (typeof value) {
//       case 'string': {
//         return 'S';
//       }
//       case 'number': {
//         return 'N';
//       }
//       case 'boolean': {
//         return 'BOOL';
//       }
//       case 'object': {
//         if (value === null) {
//           return 'NULL';
//         }
//         return 'M';
//       }
//     }
//   }
//   throw new Error(
//     `Attribute type not supported. Attribute name '${name}'` +
//       ` , attribute type '${typeof value}'`
//   );
// }
function _resolve_dynamo_list(value, key) {
    const final_list = [];
    for (let i = 0; i < value.length; i++) {
        const list_item = value[i];
        const dynamo_value = _resolve_dynamo_item_value(list_item, key);
        final_list.push(dynamo_value);
    }
    return final_list;
}
function _resolve_dynamo_item_value(value, key) {
    if (Array.isArray(value)) {
        if (_all_strings(value)) {
            return { SS: value };
        }
        if (_all_numbers(value)) {
            return { NS: value };
        }
        return { L: _resolve_dynamo_list(value, key) };
    }
    else {
        switch (typeof value) {
            case 'string': {
                return { S: value };
            }
            case 'number': {
                return { N: value.toString() };
            }
            case 'boolean': {
                return { BOOL: value };
            }
            case 'object': {
                if (value === null) {
                    return { NULL: true };
                }
                return { M: _resolve_dynamo_map(value) };
            }
            default:
                throw new Error(`Unsupported attribute type '${typeof value}' for` +
                    ` attribute name '${key}'`);
        }
    }
}
function _all_strings(arr) {
    return arr.every((item) => typeof item === 'string');
}
function _all_numbers(arr) {
    return arr.every((item) => typeof item === 'number');
}
function _resolve_dynamo_map(item) {
    const dynamo_item = {};
    for (let [key, value] of Object.entries(item)) {
        const dynamo_value = _resolve_dynamo_item_value(value, key);
        if (!dynamo_value) {
            continue;
        }
        dynamo_item[key] = dynamo_value;
    }
    return dynamo_item;
}
//# sourceMappingURL=dynamodb.js.map